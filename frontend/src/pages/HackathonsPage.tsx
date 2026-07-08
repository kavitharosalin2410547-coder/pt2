import { Bell, ExternalLink, Plus, Trophy, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { opportunityService } from '../services/opportunityService';
import { apiClient, getErrorMessage } from '../services/apiClient';
import { useToast } from '../hooks/useToast';
import type { CreateOpportunityInput, Opportunity, OpportunityType } from '../types/opportunity';
import type { ApiSuccessResponse } from '../types/api';

const TABS_FILTER: { value: 'ALL' | OpportunityType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'HACKATHON', label: 'Hackathons' },
  { value: 'CONTEST', label: 'Contests' },
  { value: 'INTERNSHIP', label: 'Internships' },
  { value: 'FELLOWSHIP', label: 'Fellowships' },
];

const TYPE_BADGE: Record<OpportunityType, string> = {
  HACKATHON: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  INTERNSHIP: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  CONTEST: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  FELLOWSHIP: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

interface LiveHackathon {
  id: string;
  title: string;
  organizer: string;
  type: string;
  mode: string;
  prizePool: string;
  teamSize: string;
  link: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  tags: string[];
  eligibility: string;
  daysLeft: number;
  isExpired: boolean;
}

const EMPTY_FORM: CreateOpportunityInput = {
  title: '', organizer: '', type: 'HACKATHON',
  startDate: '', endDate: '', registrationDeadline: '',
  link: '', prizePool: '', teamSize: '', mode: '',
};

function daysUntil(date: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(date); target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function HackathonsPage() {
  const { notify } = useToast();
  const [mainTab, setMainTab] = useState<'live-feed' | 'my-list'>('live-feed');
  const [filterTab, setFilterTab] = useState<'ALL' | OpportunityType>('ALL');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveHackathon[]>([]);
  const [liveFilter, setLiveFilter] = useState<'ALL' | 'HACKATHON' | 'CONTEST'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [error, setError] = useState('');
  const [feedError, setFeedError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateOpportunityInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    opportunityService.list()
      .then(setOpportunities)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));

    apiClient.get<ApiSuccessResponse<LiveHackathon[]>>('/opportunities/live-feed')
      .then((r) => setLiveFeed(r.data.data))
      .catch((err: unknown) => setFeedError(getErrorMessage(err)))
      .finally(() => setIsLoadingFeed(false));
  }, []);

  const filtered = filterTab === 'ALL' ? opportunities : opportunities.filter((o) => o.type === filterTab);
  const filteredLive = liveFilter === 'ALL' ? liveFeed : liveFeed.filter((h) => h.type === liveFilter);
  const activeLive = filteredLive.filter((h) => !h.isExpired);
  const expiredLive = filteredLive.filter((h) => h.isExpired);

  async function handleSave() {
    if (!form.title.trim() || !form.organizer.trim() || !form.link.trim() || !form.registrationDeadline) {
      notify('Fill in title, organizer, link, and registration deadline.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const created = await opportunityService.create({
        ...form,
        startDate: form.startDate || form.registrationDeadline,
        endDate: form.endDate || form.registrationDeadline,
      });
      setOpportunities((prev) => [...prev, created]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      notify('Opportunity added.', 'success');
    } catch { notify('Failed to add.', 'error'); }
    finally { setIsSaving(false); }
  }

  async function toggleRegistered(opp: Opportunity) {
    try {
      const updated = await opportunityService.update(opp.id, { isRegistered: !opp.isRegistered });
      setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch { notify('Failed to update.', 'error'); }
  }

  async function handleDelete(id: string) {
    try {
      await opportunityService.remove(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      notify('Removed.', 'success');
    } catch { notify('Failed to remove.', 'error'); }
  }

  async function addToMyList(h: LiveHackathon) {
    try {
      const created = await opportunityService.create({
        title: h.title,
        organizer: h.organizer,
        type: h.type as OpportunityType,
        startDate: h.startDate,
        endDate: h.endDate,
        registrationDeadline: h.registrationDeadline,
        link: h.link,
        prizePool: h.prizePool,
        teamSize: h.teamSize,
        mode: h.mode,
      });
      setOpportunities((prev) => [...prev, created]);
      notify('Added to My List!', 'success');
    } catch { notify('Failed to add to list.', 'error'); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Hackathons & Opportunities</h2>
          <p className="mt-1 text-sm text-slate-500">Live feed of real competitions + your personal tracker.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Manually
        </Button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-card dark:border-ink-3 dark:bg-ink-2">
        {([
          { key: 'live-feed', label: '⚡ Live Feed' },
          { key: 'my-list', label: `My List (${opportunities.length})` },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMainTab(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              mainTab === t.key
                ? 'bg-brand-gradient text-white shadow-glow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Live Feed Tab ── */}
      {mainTab === 'live-feed' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {(['ALL', 'HACKATHON', 'CONTEST'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLiveFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    liveFilter === f
                      ? 'bg-brand-gradient text-white shadow-glow'
                      : 'bg-surface-2 text-slate-600 hover:bg-slate-200 dark:bg-ink-3 dark:text-slate-300'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Zap size={12} className="text-amber-500" />
              <span>Curated real events — click to open registration</span>
            </div>
          </div>

          {feedError && <ErrorState message={feedError} />}
          {isLoadingFeed ? <LoadingState label="Fetching live hackathon feed" /> : (
            <>
              {activeLive.length === 0 && expiredLive.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-ink-3">
                  <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400">No active events found</p>
                </div>
              ) : (
                <>
                  {activeLive.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Active — {activeLive.length} event{activeLive.length !== 1 ? 's' : ''}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {activeLive.map((h) => (
                          <LiveCard key={h.id} h={h} onAdd={() => addToMyList(h)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {expiredLive.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Closed / Expired
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 opacity-60">
                        {expiredLive.map((h) => <LiveCard key={h.id} h={h} onAdd={() => addToMyList(h)} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My List Tab ── */}
      {mainTab === 'my-list' && (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS_FILTER.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFilterTab(t.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filterTab === t.value
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'bg-surface-2 text-slate-600 hover:bg-slate-200 dark:bg-ink-3 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && <ErrorState message={error} />}
          {isLoading ? <LoadingState label="Loading opportunities" /> : (
            filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-ink-3">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">
                  No opportunities yet.{' '}
                  <button type="button" className="font-semibold text-brand-600 hover:underline dark:text-brand-400" onClick={() => setMainTab('live-feed')}>
                    Browse the Live Feed
                  </button>{' '}
                  or add manually.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((opp) => {
                  const days = daysUntil(opp.registrationDeadline);
                  const closingSoon = days >= 0 && days <= 3;
                  const expired = days < 0;
                  return (
                    <div key={opp.id} className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ink-3 dark:bg-ink-2">
                      <button type="button" onClick={() => handleDelete(opp.id)} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20">
                        <X size={13} />
                      </button>
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TYPE_BADGE[opp.type]}`}>{opp.type}</span>
                        {closingSoon && !expired && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">Closing Soon!</span>}
                        {expired && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-400">Closed</span>}
                        {opp.isRegistered && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-600">Registered ✓</span>}
                      </div>
                      <h3 className="pr-6 text-sm font-bold text-slate-900 dark:text-white">{opp.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{opp.organizer}</p>
                      <div className="my-3 space-y-1 text-xs text-slate-500">
                        {opp.prizePool && <p>🏆 {opp.prizePool}</p>}
                        {opp.teamSize && <p>👥 {opp.teamSize}</p>}
                        {opp.mode && <p>📍 {opp.mode}</p>}
                        <p className={closingSoon && !expired ? 'font-semibold text-red-600' : ''}>
                          📅 Deadline: {new Date(opp.registrationDeadline).toLocaleDateString()}
                          {!expired && ` (${days}d left)`}
                        </p>
                      </div>
                      <div className="mt-auto flex gap-2">
                        <a href={opp.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 text-xs font-bold text-white shadow-glow hover:brightness-110">
                          <ExternalLink size={12} /> Register
                        </a>
                        <button type="button" onClick={() => toggleRegistered(opp)} className={`h-9 rounded-xl border px-3 text-xs font-semibold transition ${opp.isRegistered ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-ink-3 dark:bg-ink-3 dark:text-slate-300'}`}>
                          {opp.isRegistered ? '✓' : 'Mark'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-ink-3 dark:bg-ink-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Add Opportunity</h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Title *', field: 'title', placeholder: 'CodeStorm 2025' },
                { label: 'Organizer *', field: 'organizer', placeholder: 'DevFolio' },
                { label: 'Prize Pool', field: 'prizePool', placeholder: '₹1,00,000' },
                { label: 'Team Size', field: 'teamSize', placeholder: '1–4' },
                { label: 'Mode', field: 'mode', placeholder: 'Online / Offline' },
                { label: 'Link *', field: 'link', placeholder: 'https://...' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                    placeholder={placeholder}
                    value={form[field as keyof CreateOpportunityInput] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Type</label>
                <select className="w-full rounded-xl border border-slate-200 bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as OpportunityType }))}>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTEST">Contest</option>
                  <option value="FELLOWSHIP">Fellowship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Registration Deadline *</label>
                <input type="date" className="w-full rounded-xl border border-slate-200 bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white" value={form.registrationDeadline} onChange={(e) => setForm((f) => ({ ...f, registrationDeadline: e.target.value }))} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} isLoading={isSaving}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveCard({ h, onAdd }: { h: LiveHackathon; onAdd: () => void }) {
  const urgency = !h.isExpired && h.daysLeft <= 7;
  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:bg-ink-2 ${urgency ? 'border-red-200 dark:border-red-900/40' : 'border-slate-200/80 dark:border-ink-3'}`}>
      {urgency && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-950/30">
          <Bell size={10} className="text-red-600 dark:text-red-400" />
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Closing soon</span>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${h.type === 'HACKATHON' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
          {h.type}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-ink-3 dark:text-slate-400">{h.mode}</span>
      </div>

      <h3 className="pr-12 text-sm font-bold text-slate-900 dark:text-white">{h.title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{h.organizer}</p>

      <div className="my-3 space-y-1 text-xs text-slate-500">
        {h.prizePool && <p>🏆 {h.prizePool}</p>}
        {h.teamSize && <p>👥 Team: {h.teamSize}</p>}
        <p className={urgency ? 'font-semibold text-red-600 dark:text-red-400' : ''}>
          📅 Deadline: {new Date(h.registrationDeadline).toLocaleDateString()}
          {!h.isExpired && ` (${h.daysLeft}d left)`}
          {h.isExpired && ' (closed)'}
        </p>
      </div>

      {h.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {h.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950/30 dark:text-brand-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mb-3 text-[10px] text-slate-400">{h.eligibility}</p>

      <div className="mt-auto flex gap-2">
        <a href={h.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 text-xs font-bold text-white shadow-glow hover:brightness-110">
          <ExternalLink size={12} /> Register
        </a>
        <button type="button" onClick={onAdd} className="h-9 rounded-xl border border-slate-200 bg-surface-2 px-3 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-ink-3 dark:bg-ink-3 dark:text-slate-300" title="Add to My List">
          + List
        </button>
      </div>
    </div>
  );
}
