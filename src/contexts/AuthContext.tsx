import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { auth } from "../lib/auth";
import { UserPublic } from "../client/types.gen";
import { client } from "../client/client.gen";
import { getCurrentUserApiV1LoginCurrentUserGet } from "../client/sdk.gen";

// Role Hierarchy
export enum Role {
  SUPER = "SUPER",
  ADMIN = "ADMIN",
  USER = "USER",
}

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessDenied: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: Role) => boolean;
  setAccessDenied: (denied: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchProfile = async (currentToken: string) => {
    try {
      // Set token for the client immediately so the profile request is authorized
      auth.setToken(currentToken);

      const response = await getCurrentUserApiV1LoginCurrentUserGet();
      if (response.data) {
        const profile = response.data;
        setUser(profile);
        const mappedRole = (profile.role || "USER").toUpperCase() as Role;
        setRole(mappedRole);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return false;
    }
  };

  const decodeAndSetUser = async (newToken: string) => {
    try {
      setToken(newToken);
      const success = await fetchProfile(newToken);

      if (!success) {
        // Fallback to JWT decoding if API fails
        const decoded: any = jwtDecode(newToken);
        const rawRole = (
          decoded.role ||
          decoded.user_role ||
          "USER"
        ).toUpperCase();
        setRole(rawRole as Role);

        setUser({
          id: decoded.sub || "",
          email: decoded.email || "",
          full_name: decoded.full_name || "",
          role: rawRole.toLowerCase() as any,
          is_active: true,
        });
      }

      setAccessDenied(false);
    } catch (error) {
      console.error("Auth initialization error:", error);
      logout();
    }
  };

  const login = (newToken: string) => {
    decodeAndSetUser(newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setAccessDenied(false);
    auth.clearToken();
  };

  const hasPermission = (requiredRole: Role): boolean => {
    if (!role) return false;
    const hierarchy = {
      [Role.SUPER]: 3,
      [Role.ADMIN]: 2,
      [Role.USER]: 1,
    };
    return hierarchy[role] >= hierarchy[requiredRole];
  };

  useEffect(() => {
    const initAuth = async () => {
      auth.initialize();
      const storedToken = auth.getToken();
      if (storedToken) {
        await decodeAndSetUser(storedToken);
      }
      setIsLoading(false);
    };

    // Setup Interceptor for 403 Forbidden
    const interceptor = client.interceptors.response.use((response) => {
      if (response.status === 403) {
        setAccessDenied(true);
      }
      return response;
    });

    initAuth();

    return () => {
      client.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: !!token,
      isLoading,
      accessDenied,
      login,
      logout,
      hasPermission,
      setAccessDenied,
    }),
    [user, token, role, isLoading, accessDenied],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useHasPermission = (requiredRole: Role) => {
  const { hasPermission } = useAuth();
  return hasPermission(requiredRole);
};
