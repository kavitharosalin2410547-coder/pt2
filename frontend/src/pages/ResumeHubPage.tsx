import { useCallback, useEffect, useState } from 'react';
import { Bot, Download, FileText, Pencil, ShieldCheck, Sparkles, Target, Trash2, X } from 'lucide-react';
import { ProgressBar } from '../components/analytics/ProgressBar';
import { LearningChart } from '../components/learning/LearningChart';
import { Button } from '../components/common/Button';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { Input } from '../components/common/Input';
import { LoadingState } from '../components/common/LoadingState';
import { StatCard } from '../components/common/StatCard';
import { useToast } from '../hooks/useToast';
import { aiService } from '../services/aiService';
import type { ATSResult } from '../services/aiService';
import { resumeService } from '../services/resumeService';
import { getErrorMessage } from '../services/apiClient';
import type { ResumeInput, ResumeStatistics, ResumeVersion } from '../types/resume';
import { formatDate } from '../utils/date';

const checklistItems: Array<{ key: keyof ResumeInput; label: string }> = [
  { key: 'checklistProjects', label: 'Projects' },
  { key: 'checklistSkills', label: 'Skills' },
  { key: 'checklistEducation', label: 'Education' },
  { key: 'checklistExperience', label: 'Experience' },
  { key: 'checklistAchievements', label: 'Achievements' },
  { key: 'checklistCertifications', label: 'Certifications' },
];

const atsItems: Array<{ key: keyof ResumeInput; label: string }> = [
  { key: 'atsContactInformation', label: 'Contact Information' },
  { key: 'atsSkillsSection', label: 'Skills Section' },
  { key: 'atsProjectsSection', label: 'Projects Section' },
  { key: 'atsKeywords', label: 'Keywords' },
  { key: 'atsFormatting', label: 'Formatting' },
];

function createEmptyResume(resumes: ResumeVersion[] = []): ResumeInput {
  return {
    resumeName: '',
    resumeVersion: nextResumeVersion(resumes),
    targetRole: '',
    lastUpdatedDate: new Date().toISOString().slice(0, 10),
    fileName: null,
    fileMimeType: null,
    fileData: null,
    checklistProjects: false,
    checklistSkills: false,
    checklistEducation: false,
    checklistExperience: false,
    checklistAchievements: false,
    checklistCertifications: false,
    atsContactInformation: false,
    atsSkillsSection: false,
    atsProjectsSection: false,
    atsKeywords: false,
    atsFormatting: false,
  };
}

function nextResumeVersion(resumes: ResumeVersion[]) {
  const nums = resumes
    .map((r) => /^v\s*(\d+)$/i.exec(r.resumeVersion.trim()))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .map((m) => Number(m[1]))
    .filter(Number.isFinite);
  return nums.length === 0 ? 'v1' : `v${Math.max(...nums) + 1}`;
}

function completion(item: ResumeInput | ResumeVersion, keys: Array<keyof ResumeInput>) {
  return Math.round((keys.filter((k) => Boolean(item[k])).length / keys.length) * 100);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const SCORE_COLOR = (v: number) =>
  v >= 75 ? 'text-emerald-600 dark:text-emerald-400'
  : v >= 50 ? 'text-amber-600 dark:text-amber-400'
  : 'text-red-600 dark:text-red-400';

const SCORE_BG = (v: number) =>
  v >= 75 ? 'bg-emerald-500'
  : v >= 50 ? 'bg-amber-500'
  : 'bg-red-500';

export function ResumeHubPage() {
  const { notify } = useToast();
  const [tab, setTab] = useState<'versions' | 'ats-scorer'>('ats-scorer');
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [statistics, setStatistics] = useState<ResumeStatistics | null>(null);
  const [form, setForm] = useState<ResumeInput>(createEmptyResume());
  const [editingResume, setEditingResume] = useState<ResumeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ATS scorer state
  const [resumeText, setResumeText] = useState('');
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [isScoringATS, setIsScoringATS] = useState(false);
  const [atsError, setAtsError] = useState('');

  const loadData = useCallback(async (resetDraft = false) => {
    setIsLoading(true);
    try {
      const [resumeList, stats] = await Promise.all([resumeService.list(), resumeService.statistics()]);
      setResumes(resumeList);
      setStatistics(stats);
      setError('');
      if (resetDraft) setForm(createEmptyResume(resumeList));
      return resumeList;
    } catch {
      setError('Unable to load resume hub.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(true); }, [loadData]);

  function updateForm<K extends keyof ResumeInput>(key: K, value: ResumeInput[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((c) => ({ ...c, fileName: file.name, fileMimeType: file.type || 'application/octet-stream', fileData: dataUrl, lastUpdatedDate: new Date().toISOString().slice(0, 10) }));
  }

  async function saveResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.resumeName.trim().length < 2 || form.targetRole.trim().length < 2) {
      notify('Resume name and target role are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingResume) {
        await resumeService.update(editingResume.id, form);
        notify('Resume updated.', 'success');
      } else {
        await resumeService.create(form);
        notify('Resume version saved.', 'success');
      }
      await loadData(true);
      setEditingResume(null);
    } catch { notify('Unable to save resume.', 'error'); }
    finally { setIsSubmitting(false); }
  }

  function startEdit(resume: ResumeVersion) {
    setEditingResume(resume);
    setForm({
      resumeName: resume.resumeName, resumeVersion: resume.resumeVersion,
      targetRole: resume.targetRole, lastUpdatedDate: resume.lastUpdatedDate.slice(0, 10),
      fileName: resume.fileName, fileMimeType: resume.fileMimeType, fileData: resume.fileData,
      checklistProjects: resume.checklistProjects, checklistSkills: resume.checklistSkills,
      checklistEducation: resume.checklistEducation, checklistExperience: resume.checklistExperience,
      checklistAchievements: resume.checklistAchievements, checklistCertifications: resume.checklistCertifications,
      atsContactInformation: resume.atsContactInformation, atsSkillsSection: resume.atsSkillsSection,
      atsProjectsSection: resume.atsProjectsSection, atsKeywords: resume.atsKeywords, atsFormatting: resume.atsFormatting,
    });
    setTab('versions');
  }

  async function deleteResume(id: string) {
    try { await resumeService.remove(id); notify('Deleted.', 'success'); loadData(); }
    catch { notify('Unable to delete resume.', 'error'); }
  }

  function downloadResume(resume: ResumeVersion) {
    if (!resume.fileData || !resume.fileName) { notify('No file attached to this resume.', 'error'); return; }
    const link = document.createElement('a');
    link.href = resume.fileData;
    link.download = resume.fileName;
    link.click();
  }

  async function runATSScore() {
    if (resumeText.trim().length < 50) { notify('Paste at least 50 characters of resume text.', 'error'); return; }
    setIsScoringATS(true);
    setAtsError('');
    setAtsResult(null);
    try {
      const result = await aiService.scoreResume(resumeText);
      setAtsResult(result);
    } catch (err) {
      setAtsError(getErrorMessage(err));
    } finally {
      setIsScoringATS(false);
    }
  }

  const currentResumeScore = completion(form, checklistItems.map((i) => i.key));
  const currentAtsScore = completion(form, atsItems.map((i) => i.key));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Resume Hub</h2>
        <p className="mt-1 text-sm text-slate-500">AI-powered ATS scoring, resume versions, and readiness tracker.</p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Resume Versions" value={statistics?.totalResumes ?? 0} tone="indigo" icon={<FileText size={15} />} />
        <StatCard title="Resume Score" value={`${statistics?.resumeScore ?? 0}%`} tone="emerald" icon={<Target size={15} />} />
        <StatCard title="ATS Score" value={`${statistics?.atsScore ?? 0}%`} tone="blue" icon={<ShieldCheck size={15} />} />
        <StatCard title="Latest Resume" value={statistics?.latestResumeName ?? 'None'} tone="slate" />
      </section>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-card dark:border-ink-3 dark:bg-ink-2">
        {([
          { key: 'ats-scorer', label: '✨ AI ATS Scorer' },
          { key: 'versions', label: 'Resume Versions' },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              tab === t.key
                ? 'bg-brand-gradient text-white shadow-glow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} />}

      {/* ── AI ATS Scorer Tab ── */}
      {tab === 'ats-scorer' && (
        <div className="space-y-5">
          <DashboardCard title="AI ATS Resume Scorer" icon={<Sparkles size={14} />}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Paste your resume text below. Gemini will analyze it like a real ATS system — checking keywords, formatting, sections, and impact statements.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Resume Text *</label>
                <textarea
                  rows={10}
                  className="w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                  placeholder="Paste your resume content here (plain text or copy-paste from your PDF/Word doc)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-400">{resumeText.length} characters</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={runATSScore} isLoading={isScoringATS}>
                  <Sparkles size={15} />
                  {isScoringATS ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
                {atsResult && (
                  <Button variant="ghost" onClick={() => { setAtsResult(null); setResumeText(''); }}>
                    <X size={14} /> Clear
                  </Button>
                )}
              </div>
              {atsError && <ErrorState message={atsError} />}
            </div>
          </DashboardCard>

          {atsResult && (
            <div className="space-y-4">
              {/* Overall score */}
              <div
                className="relative overflow-hidden rounded-3xl p-7 text-white"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 80%, #6366f1 100%)' }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
                <div className="relative flex flex-col items-center text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Overall ATS Score</p>
                  <p className="mt-2 text-7xl font-black">{atsResult.score}</p>
                  <p className="text-2xl font-bold text-indigo-200">/ 100</p>
                  <div className="mt-4 w-full max-w-sm">
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-700"
                        style={{ width: `${atsResult.score}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-indigo-200">
                    {atsResult.score >= 80 ? '🚀 Excellent ATS compatibility'
                    : atsResult.score >= 60 ? '✅ Good — some improvements possible'
                    : atsResult.score >= 40 ? '⚠️ Needs work before submitting'
                    : '❌ Major ATS issues found'}
                  </p>
                </div>
              </div>

              {/* Score breakdown */}
              <DashboardCard title="Score Breakdown">
                <div className="space-y-4">
                  {(Object.entries(atsResult.breakdown) as Array<[string, number]>).map(([key, val]) => (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-sm font-black ${SCORE_COLOR(val)}`}>{val}/100</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-ink-3">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${SCORE_BG(val)}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Strengths */}
                <DashboardCard title="Strengths">
                  <ul className="space-y-2">
                    {atsResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">✓</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{s}</p>
                      </li>
                    ))}
                  </ul>
                </DashboardCard>

                {/* Improvements */}
                <DashboardCard title="Improvements Needed">
                  <ul className="space-y-2">
                    {atsResult.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">!</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{imp}</p>
                      </li>
                    ))}
                  </ul>
                </DashboardCard>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/30 dark:bg-brand-950/20">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Tip</p>
                </div>
                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                  Aim for a score of 80+ before submitting to companies. Focus on the lowest-scoring categories first. Keywords and quantified impact statements have the biggest effect on ATS parsing.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Resume Versions Tab ── */}
      {tab === 'versions' && (
        <div className="space-y-5">
          <form
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-ink-3 dark:bg-ink-2"
            onSubmit={saveResume}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                {editingResume ? 'Edit Resume Version' : 'Add Resume Version'}
              </h3>
              {editingResume && (
                <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => { setEditingResume(null); setForm(createEmptyResume(resumes)); }}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input label="Resume Name" value={form.resumeName} onChange={(e) => updateForm('resumeName', e.target.value)} required />
              <Input label="Version" value={form.resumeVersion} onChange={(e) => updateForm('resumeVersion', e.target.value)} required />
              <Input label="Target Role" value={form.targetRole} onChange={(e) => updateForm('targetRole', e.target.value)} required />
              <Input label="Last Updated" type="date" value={form.lastUpdatedDate} onChange={(e) => updateForm('lastUpdatedDate', e.target.value)} required />
              <label className="block md:col-span-2 xl:col-span-4">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Upload Resume File</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm text-slate-700 outline-none dark:border-ink-3 dark:bg-ink-3 dark:text-slate-300"
                />
                {form.fileName && <span className="mt-1 block text-xs text-brand-600 dark:text-brand-400">📎 {form.fileName}</span>}
              </label>
            </div>

            <section className="mt-5 grid gap-4 xl:grid-cols-2">
              <Checklist title="Resume Checklist" score={currentResumeScore} items={checklistItems} form={form} onToggle={updateForm} />
              <Checklist title="ATS Checklist" score={currentAtsScore} items={atsItems} form={form} onToggle={updateForm} />
            </section>

            <Button className="mt-5" type="submit" isLoading={isSubmitting}>
              {editingResume ? 'Update Resume' : 'Save Resume Version'}
            </Button>
          </form>

          {isLoading ? <LoadingState label="Loading resumes" /> : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {resumes.map((resume) => (
                  <article key={resume.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ink-3 dark:bg-ink-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                        <FileText size={18} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{resume.resumeName}</h4>
                        <p className="text-xs text-slate-500">{resume.fileName ?? 'No file attached'}</p>
                      </div>
                      <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                        {resume.resumeVersion}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ScoreBar label="Resume Readiness" value={completion(resume, checklistItems.map((i) => i.key))} />
                      <ScoreBar label="ATS Readiness" value={completion(resume, atsItems.map((i) => i.key))} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{resume.targetRole}</span>
                      <span>{formatDate(resume.lastUpdatedDate)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => startEdit(resume)}><Pencil size={12} />Edit</Button>
                      <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => downloadResume(resume)}><Download size={12} />Download</Button>
                      <Button variant="danger" className="h-8 px-3 text-xs" onClick={() => deleteResume(resume.id)}><Trash2 size={12} />Delete</Button>
                    </div>
                  </article>
                ))}
                {resumes.length === 0 && (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-ink-3">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400">No resume versions saved yet.</p>
                  </div>
                )}
              </div>

              <LearningChart title="Resume Readiness Over Time" data={statistics?.charts.resumeReadiness ?? []} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Checklist({ title, score, items, form, onToggle }: {
  title: string; score: number;
  items: Array<{ key: keyof ResumeInput; label: string }>;
  form: ResumeInput;
  onToggle: <K extends keyof ResumeInput>(key: K, value: ResumeInput[K]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface-2 p-4 dark:border-ink-3 dark:bg-ink-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h4>
        <span className={`text-sm font-black ${SCORE_COLOR(score)}`}>{score}%</span>
      </div>
      <ProgressBar value={score} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={String(item.key)} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-brand-50 dark:bg-ink-2 dark:text-slate-300 dark:hover:bg-brand-950/20">
            <input type="checkbox" className="accent-brand-600" checked={Boolean(form[item.key])} onChange={(e) => onToggle(item.key, e.target.checked as never)} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3 dark:bg-ink-3">
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className={`font-black ${SCORE_COLOR(value)}`}>{value}%</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}
