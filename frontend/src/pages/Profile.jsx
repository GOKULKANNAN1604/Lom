/**
 * src/pages/Profile.jsx
 * Personal Digital Locker & Vault — stores secure personal IDs, bank accounts, and custom credentials.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, patchProfile } from '../api/profile';

export default function ProfilePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [customItems, setCustomItems] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showSensitive, setShowSensitive] = useState({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then(r => r.data),
  });

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || '',
        portfolio_url: data.portfolio_url || '',
      });
      // Map custom_vault JSON to local edit list
      const items = Object.entries(data.custom_vault || {}).map(([k, v]) => ({
        id: Math.random().toString(),
        key: k,
        value: v,
      }));
      setCustomItems(items);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (d) => patchProfile(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Clipboard copy handler
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Sensitivity visibility toggle
  const toggleVisibility = (key) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom vault key-value actions
  const addCustomItem = () => {
    setCustomItems((items) => [...items, { id: Math.random().toString(), key: '', value: '' }]);
  };

  const removeCustomItem = (id) => {
    setCustomItems((items) => items.filter((it) => it.id !== id));
  };

  const handleCustomChange = (id, field, val) => {
    setCustomItems((items) =>
      items.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Convert customItems array back to JSON object
    const vaultObj = {};
    customItems.forEach((it) => {
      if (it.key.trim()) {
        vaultObj[it.key.trim()] = it.value;
      }
    });

    const payload = {
      ...form,
      custom_vault: vaultObj,
    };
    save.mutate(payload);
  };

  if (isLoading || !form) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-white/[0.05] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 glass-card animate-pulse" />
          <div className="h-64 glass-card animate-pulse" />
        </div>
      </div>
    );
  }

  // Common styled sections
  const SectionHeader = ({ title, icon }) => (
    <h3 className="text-sm font-bold text-primary border-b border-white/[0.06] pb-2 mb-4 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h3>
  );

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page Title & Save bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2.5">
            <span>🛡️</span> Digital Locker & Vault
          </h1>
          <p className="text-secondary text-sm mt-1">Secure place to store identities, bank details, and personal credentials.</p>
        </div>
        <button
          onClick={handleFormSubmit}
          disabled={save.isPending}
          className="btn-primary w-full sm:w-auto px-6 py-2.5"
        >
          {save.isPending ? 'Saving Locker…' : saved ? '✅ Locker Saved!' : 'Save Locker'}
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="glass-card p-6 space-y-4">
          <SectionHeader title="👤 Personal Details" icon="🪪" />
          
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name || ''}
              onChange={handleFieldChange}
              className="input"
              placeholder="Gokul"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth || ''}
                onChange={handleFieldChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <input
                type="text"
                name="blood_group"
                value={form.blood_group || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="O +ve"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="yourmail@gmail.com"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GOVERNMENT CREDENTIALS LOCKER */}
        <div className="glass-card p-6 space-y-4">
          <SectionHeader title="Government IDs Locker" icon="💳" />

          {/* Aadhaar */}
          <div>
            <label className="label">Aadhaar Card Number</label>
            <div className="flex items-center gap-2">
              <input
                type={showSensitive.aadhaar ? 'text' : 'password'}
                name="aadhaar_number"
                value={form.aadhaar_number || ''}
                onChange={handleFieldChange}
                className="input font-mono tracking-wider"
                placeholder="0000 0000 0000"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('aadhaar')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                title="Toggle Visibility"
              >
                {showSensitive.aadhaar ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(form.aadhaar_number, 'aadhaar')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                title="Copy to clipboard"
              >
                {copiedKey === 'aadhaar' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* PAN Card */}
          <div>
            <label className="label">PAN Card Number</label>
            <div className="flex items-center gap-2">
              <input
                type={showSensitive.pan ? 'text' : 'password'}
                name="pan_number"
                value={form.pan_number || ''}
                onChange={handleFieldChange}
                className="input font-mono tracking-wider uppercase"
                placeholder="ABCDE1234F"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('pan')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {showSensitive.pan ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(form.pan_number, 'pan')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {copiedKey === 'pan' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Driving License */}
          <div>
            <label className="label">Driving License Number</label>
            <div className="flex items-center gap-2">
              <input
                type={showSensitive.dl ? 'text' : 'password'}
                name="driving_license"
                value={form.driving_license || ''}
                onChange={handleFieldChange}
                className="input font-mono uppercase"
                placeholder="TN-01-XXXX-YYYY"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('dl')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {showSensitive.dl ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(form.driving_license, 'dl')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {copiedKey === 'dl' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Passport */}
          <div>
            <label className="label">Passport Number</label>
            <div className="flex items-center gap-2">
              <input
                type={showSensitive.passport ? 'text' : 'password'}
                name="passport_no"
                value={form.passport_no || ''}
                onChange={handleFieldChange}
                className="input font-mono uppercase"
                placeholder="N1234567"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('passport')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {showSensitive.passport ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(form.passport_no, 'passport')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {copiedKey === 'passport' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: BANK & FINANCIAL ACCOUNTS */}
        <div className="glass-card p-6 space-y-4">
          <SectionHeader title="🏦 Bank & UPI Accounts" icon="🪙" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={form.bank_name || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="SBI, HDFC, ICICI"
              />
            </div>
            <div>
              <label className="label">IFSC Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="ifsc_code"
                  value={form.ifsc_code || ''}
                  onChange={handleFieldChange}
                  className="input font-mono uppercase"
                  placeholder="SBIN0001234"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(form.ifsc_code, 'ifsc')}
                  className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                >
                  {copiedKey === 'ifsc' ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Account Number</label>
            <div className="flex items-center gap-2">
              <input
                type={showSensitive.account ? 'text' : 'password'}
                name="account_no"
                value={form.account_no || ''}
                onChange={handleFieldChange}
                className="input font-mono"
                placeholder="12345678901"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('account')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {showSensitive.account ? '👁️' : '🙈'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(form.account_no, 'account')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {copiedKey === 'account' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div>
            <label className="label">UPI ID (VPA)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="upi_id"
                value={form.upi_id || ''}
                onChange={handleFieldChange}
                className="input font-mono lowercase"
                placeholder="gokul@ybl"
              />
              <button
                type="button"
                onClick={() => handleCopy(form.upi_id, 'upi')}
                className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
              >
                {copiedKey === 'upi' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: EMERGENCY CONTACT & MEDICAL */}
        <div className="glass-card p-6 space-y-4">
          <SectionHeader title="🚨 Emergency & Medical" icon="🏥" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_name"
                value={form.emergency_name || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="Father, Friend Name"
              />
            </div>
            <div>
              <label className="label">Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_phone"
                value={form.emergency_phone || ''}
                onChange={handleFieldChange}
                className="input"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div>
            <label className="label">Medical / Policy Notes</label>
            <textarea
              name="medical_notes"
              value={form.medical_notes || ''}
              onChange={handleFieldChange}
              rows={3}
              className="input resize-none"
              placeholder="Allergies, chronic conditions, health insurance policy numbers..."
            />
          </div>
        </div>

        {/* SECTION 5: PROFESSIONAL & SOCIAL LINKS */}
        <div className="glass-card p-6 space-y-4">
          <SectionHeader title="🔗 Professional & Social Links" icon="🌐" />

          {/* LinkedIn */}
          <div>
            <label className="label">LinkedIn URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="linkedin_url"
                value={form.linkedin_url || ''}
                onChange={handleFieldChange}
                className="input font-mono text-xs"
                placeholder="https://linkedin.com/in/username"
              />
              {form.linkedin_url && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCopy(form.linkedin_url, 'linkedin')}
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                    title="Copy URL"
                  >
                    {copiedKey === 'linkedin' ? '✓' : '📋'}
                  </button>
                  <a
                    href={form.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center"
                    title="Open URL"
                  >
                    🔗
                  </a>
                </>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div>
            <label className="label">GitHub URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="github_url"
                value={form.github_url || ''}
                onChange={handleFieldChange}
                className="input font-mono text-xs"
                placeholder="https://github.com/username"
              />
              {form.github_url && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCopy(form.github_url, 'github')}
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                    title="Copy URL"
                  >
                    {copiedKey === 'github' ? '✓' : '📋'}
                  </button>
                  <a
                    href={form.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center"
                    title="Open URL"
                  >
                    🔗
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <label className="label">Portfolio URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="portfolio_url"
                value={form.portfolio_url || ''}
                onChange={handleFieldChange}
                className="input font-mono text-xs"
                placeholder="https://username.dev"
              />
              {form.portfolio_url && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCopy(form.portfolio_url, 'portfolio')}
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                    title="Copy URL"
                  >
                    {copiedKey === 'portfolio' ? '✓' : '📋'}
                  </button>
                  <a
                    href={form.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center"
                    title="Open URL"
                  >
                    🔗
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: CUSTOM VAULT LOCKER */}
        <div className="glass-card p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <span>🔑</span> Custom Credentials & Vault Notes
            </h3>
            <button
              type="button"
              onClick={addCustomItem}
              className="text-xs bg-tech/15 text-tech border border-tech/30 hover:bg-tech/25 px-3 py-1.5 rounded-xl font-medium transition-colors"
            >
              + Add Detail
            </button>
          </div>

          {customItems.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">No custom details added. Use the button above to store subscriptions, WiFi keys, or account details.</p>
          ) : (
            <div className="space-y-3">
              {customItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => handleCustomChange(item.id, 'key', e.target.value)}
                    className="input sm:w-1/3 text-xs"
                    placeholder="e.g. WiFi Password, Netflix Email"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type={showSensitive[item.id] ? 'text' : 'password'}
                      value={item.value}
                      onChange={(e) => handleCustomChange(item.id, 'value', e.target.value)}
                      className="input text-xs font-mono"
                      placeholder="Detail / Password / Info"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(item.id)}
                      className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                    >
                      {showSensitive[item.id] ? '👁️' : '🙈'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value, item.id)}
                      className="p-2.5 bg-white/5 border border-border rounded-xl text-xs text-secondary hover:text-primary transition-colors"
                    >
                      {copiedKey === item.id ? '✓' : '📋'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomItem(item.id)}
                      className="p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Save Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {save.isPending ? 'Saving Locker…' : saved ? '✅ Locker Details Saved Successfully!' : 'Save Digital Locker'}
          </button>
        </div>
      </form>
    </div>
  );
}
