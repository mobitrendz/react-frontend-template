import { X, Shield, Lock, User, Mail } from "lucide-react";

interface CreateAdminFormProps {
  email: string;
  fullName: string;
  isSubmitting: boolean;
  isSuper: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onFullNameChange: (val: string) => void;
}

const CreateAdminForm = ({
  email,
  fullName,
  isSubmitting,
  isSuper,
  error,
  onClose,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
}: CreateAdminFormProps) => {
  return (
    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--sidebar-bg)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[var(--text-h)]">
              {isSuper ? "New Admin User" : "New System User"}
            </h3>
            <p className="text-xs text-[var(--text-dim)] font-medium uppercase tracking-widest">
              {isSuper ? "Elevated Access Account" : "Access Provisioning"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[var(--text-dim)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="full-name"
              className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-medium"
              placeholder="e.g. Sarah Connor"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admin-email"
              className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-medium"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-password"
            className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            Temporary Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-medium"
            placeholder="Min. 8 characters"
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 font-bold p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--sidebar-bg)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3.5 bg-[var(--accent)] text-white rounded-2xl font-bold hover:shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Provisioning..."
              : isSuper
                ? "Create Admin Account"
                : "Create User Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdminForm;
