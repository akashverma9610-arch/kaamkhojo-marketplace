import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, ImagePlus, MapPin, Trash2 } from 'lucide-react';
import type { Category } from './KaamComponents';
import { categoryGroups, getCategoryIcon } from './KaamComponents';

export type WorkRequestFormValue = {
  categoryId: string;
  problemTitle: string;
  description: string;
  files: File[];
  city: string;
  area: string;
  address: string;
  latitude: string;
  longitude: string;
  preferredDate: 'TODAY' | 'TOMORROW' | 'CUSTOM';
  customDate: string;
  preferredTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY_TIME';
  budgetText: string;
  budgetMin: number | null;
  budgetMax: number | null;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
};

export type WorkRequestErrors = Partial<Record<keyof WorkRequestFormValue | 'form', string>>;

type Setter = <K extends keyof WorkRequestFormValue>(key: K, value: WorkRequestFormValue[K]) => void;

function ChoiceButton({ selected, onClick, children, description }: { selected: boolean; onClick: () => void; children: React.ReactNode; description?: string }) {
  return <button type="button" onClick={onClick} className={`rounded-xl border p-3 text-left transition-colors ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}><span className="flex items-center justify-between gap-2 text-sm font-bold">{children}<span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>{selected && <Check size={12} />}</span></span>{description && <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{description}</span>}</button>;
}

export function UrgencySelector({ value, onChange }: { value: WorkRequestFormValue['urgency']; onChange: (value: WorkRequestFormValue['urgency']) => void }) {
  const options: Array<{ value: WorkRequestFormValue['urgency']; label: string; description: string }> = [
    { value: 'NORMAL', label: 'Normal', description: 'Can be scheduled at a convenient time.' },
    { value: 'URGENT', label: 'Urgent', description: 'Needs attention within the next day.' },
    { value: 'EMERGENCY', label: 'Emergency', description: 'Safety or essential service issue right now.' },
  ];
  return <div className="grid gap-2 sm:grid-cols-3">{options.map((option) => <ChoiceButton key={option.value} selected={value === option.value} onClick={() => onChange(option.value)} description={option.description}>{option.label}</ChoiceButton>)}</div>;
}

export function BudgetSelector({ value, onChange }: { value: string; onChange: (value: { text: string; min: number | null; max: number | null }) => void }) {
  const options = [{ text: 'Not Sure', min: null, max: null }, { text: 'Under ₹500', min: 0, max: 499 }, { text: '₹500–₹1,000', min: 500, max: 1000 }, { text: '₹1,000–₹2,000', min: 1000, max: 2000 }, { text: 'Above ₹2,000', min: 2000, max: null }];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map((option) => <ChoiceButton key={option.text} selected={value === option.text} onClick={() => onChange(option)}>{option.text}</ChoiceButton>)}</div>;
}

export function LocationInput({ value, onChange }: { value: Pick<WorkRequestFormValue, 'city' | 'area' | 'address' | 'latitude' | 'longitude'>; onChange: Setter }) {
  return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold">City</span><input value={value.city} onChange={(event) => onChange('city', event.target.value)} placeholder="Bengaluru" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="mb-2 block text-xs font-bold">Area / Locality</span><input value={value.area} onChange={(event) => onChange('area', event.target.value)} placeholder="Indiranagar" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label></div><label className="block"><span className="mb-2 block text-xs font-bold">Full address or landmark</span><div className="flex items-start rounded-xl border border-input bg-background px-3 focus-within:border-primary"><MapPin size={16} className="mt-3 text-muted-foreground" /><textarea value={value.address} onChange={(event) => onChange('address', event.target.value)} rows={2} placeholder="House number, street, nearby landmark" className="w-full resize-none bg-transparent px-3 py-3 text-sm outline-none" /></div></label><details className="rounded-xl border border-border px-3 py-2"><summary className="cursor-pointer text-xs font-bold text-muted-foreground">Add optional GPS coordinates</summary><div className="mt-3 grid gap-3 pb-2 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[11px] font-bold">Latitude</span><input type="number" step="any" value={value.latitude} onChange={(event) => onChange('latitude', event.target.value)} placeholder="12.9716" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="mb-2 block text-[11px] font-bold">Longitude</span><input type="number" step="any" value={value.longitude} onChange={(event) => onChange('longitude', event.target.value)} placeholder="77.5946" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label></div></details><p className="text-[11px] text-muted-foreground">Your address helps technicians find you. GPS coordinates are optional.</p></div>;
}

export function PhotoUploader({ files, onChange, error }: { files: File[]; onChange: (files: File[]) => void; error?: string }) {
  const [validationError, setValidationError] = useState('');
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const valid = selected.filter((file) => validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
    const invalidType = selected.find((file) => !validTypes.includes(file.type));
    const invalidSize = selected.find((file) => validTypes.includes(file.type) && file.size > 5 * 1024 * 1024);
    if (invalidType) setValidationError(`${invalidType.name} is not a supported image. Use JPG, PNG, WEBP or GIF.`);
    else if (invalidSize) setValidationError(`${invalidSize.name} is larger than 5 MB.`);
    else if (files.length + valid.length > 6) setValidationError('You can attach up to 6 photos.');
    else setValidationError('');
    if (valid.length) onChange([...files, ...valid].slice(0, 6));
    event.target.value = '';
  };
  return <div><label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-6 text-center hover:bg-primary/10"><ImagePlus className="text-primary" size={25} /><span className="mt-2 text-sm font-bold">Add photos of the problem</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP or GIF · max 5 MB each · up to 6</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleFiles} className="sr-only" /></label>{(error || validationError) && <p className="mt-2 text-xs font-semibold text-destructive">{error || validationError}</p>}{files.length > 0 && <div className="mt-3 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><ImagePlus size={16} /></div><p className="min-w-0 flex-1 truncate text-xs font-semibold">{file.name}<span className="ml-1 font-normal text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span></p><button type="button" onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${file.name}`}><Trash2 size={15} /></button></div>)}</div>}</div>;
}

export function DateTimeSelector({ value, onChange }: { value: Pick<WorkRequestFormValue, 'preferredDate' | 'customDate' | 'preferredTime'>; onChange: Setter }) {
  const dates: Array<{ value: WorkRequestFormValue['preferredDate']; label: string }> = [{ value: 'TODAY', label: 'Today' }, { value: 'TOMORROW', label: 'Tomorrow' }, { value: 'CUSTOM', label: 'Custom date' }];
  const times: Array<{ value: WorkRequestFormValue['preferredTime']; label: string }> = [{ value: 'MORNING', label: 'Morning' }, { value: 'AFTERNOON', label: 'Afternoon' }, { value: 'EVENING', label: 'Evening' }, { value: 'ANY_TIME', label: 'Any time' }];
  return <div className="space-y-4"><div><span className="mb-2 block text-xs font-bold">Preferred date</span><div className="grid grid-cols-3 gap-2">{dates.map((date) => <ChoiceButton key={date.value} selected={value.preferredDate === date.value} onClick={() => onChange('preferredDate', date.value)}>{date.label}</ChoiceButton>)}</div>{value.preferredDate === 'CUSTOM' && <input required type="date" value={value.customDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => onChange('customDate', event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" />}</div><div><span className="mb-2 block text-xs font-bold">Preferred time</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{times.map((time) => <ChoiceButton key={time.value} selected={value.preferredTime === time.value} onClick={() => onChange('preferredTime', time.value)}>{time.label}</ChoiceButton>)}</div></div></div>;
}

export function WorkRequestForm({ categories, value, errors, onChange, onFilesChange, onSubmit, submitting }: { categories: Category[]; value: WorkRequestFormValue; errors: WorkRequestErrors; onChange: Setter; onFilesChange: (files: File[]) => void; onSubmit: (event: FormEvent) => void; submitting: boolean }) {
  return <form onSubmit={onSubmit} className="space-y-6"><div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-7"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">The basics</p><h2 className="mt-1 font-display text-2xl font-bold">Tell us what needs doing</h2></div><label className="block"><span className="mb-2 block text-xs font-bold">Service category <span className="text-destructive">*</span></span><select required value={value.categoryId} onChange={(event) => onChange('categoryId', event.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary"><option value="">Choose a service</option>{categoryGroups.map((group) => <optgroup key={group} label={group}>{categories.filter((category) => category.group === group).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</optgroup>)}</select>{errors.categoryId && <p className="mt-2 text-xs font-semibold text-destructive">{errors.categoryId}</p>}</label><label className="mt-5 block"><span className="mb-2 block text-xs font-bold">Problem title <span className="text-destructive">*</span></span><input required maxLength={100} value={value.problemTitle} onChange={(event) => onChange('problemTitle', event.target.value)} placeholder="e.g. Ceiling fan stopped working" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" />{errors.problemTitle && <p className="mt-2 text-xs font-semibold text-destructive">{errors.problemTitle}</p>}<p className="mt-1 text-right text-[11px] text-muted-foreground">{value.problemTitle.length}/100</p></label><label className="mt-4 block"><span className="mb-2 block text-xs font-bold">Detailed description <span className="text-destructive">*</span></span><textarea required maxLength={1000} rows={5} value={value.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Share what happened, when it started, and anything the technician should know." className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 outline-none focus:border-primary" />{errors.description && <p className="mt-2 text-xs font-semibold text-destructive">{errors.description}</p>}<p className="mt-1 text-right text-[11px] text-muted-foreground">{value.description.length}/1000</p></label></div><div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-7"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Helpful context</p><h2 className="mt-1 font-display text-2xl font-bold">Add photos and location</h2></div><PhotoUploader files={value.files} onChange={onFilesChange} error={errors.files} /><div className="mt-6"><LocationInput value={value} onChange={onChange} />{(errors.city || errors.area || errors.address || errors.latitude || errors.longitude) && <p className="mt-2 text-xs font-semibold text-destructive">{errors.city || errors.area || errors.address || errors.latitude || errors.longitude}</p>}</div></div><div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-7"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Plan the visit</p><h2 className="mt-1 font-display text-2xl font-bold">When and what budget?</h2></div><DateTimeSelector value={value} onChange={onChange} />{errors.customDate && <p className="mt-2 text-xs font-semibold text-destructive">{errors.customDate}</p>}<div className="mt-6"><span className="mb-2 block text-xs font-bold">Budget range</span><BudgetSelector value={value.budgetText} onChange={(budget) => { onChange('budgetText', budget.text); onChange('budgetMin', budget.min); onChange('budgetMax', budget.max); }} />{errors.budgetText && <p className="mt-2 text-xs font-semibold text-destructive">{errors.budgetText}</p>}</div><div className="mt-6"><span className="mb-2 block text-xs font-bold">Urgency</span><UrgencySelector value={value.urgency} onChange={(urgency) => onChange('urgency', urgency)} /></div></div>{errors.form && <p className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{errors.form}</p>}<button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto sm:min-w-56">{submitting ? 'Posting your work…' : 'Post Your Work'} {!submitting && <Check size={16} />}</button></form>;
}
