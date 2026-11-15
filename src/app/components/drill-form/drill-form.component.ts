import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Drill, DrillData, DrillGroup, GROUPS, SPACES, Space } from '../../models/drill';
import { FileKind, MAX_SIZE_MB, UploadService } from '../../services/upload.service';

/** Link with http(s) or a path inside assets/. Empty is also valid (they are optional). */
const linkValidator: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  return !value || /^(https?:\/\/|assets\/)\S+$/i.test(value) ? null : { link: true };
};

const text = (...validators: ValidatorFn[]) =>
  new FormControl('', { nonNullable: true, validators });

/** The form with all the drill data. */
function buildForm() {
  return new FormGroup({
    name: text(Validators.required, Validators.maxLength(80)),
    objective: text(Validators.required, Validators.maxLength(300)),
    players: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(40),
    ]),
    space: new FormControl<Space | ''>('', { nonNullable: true, validators: [Validators.required] }),
    group: new FormControl<DrillGroup | ''>('', { nonNullable: true }),
    description: text(Validators.required, Validators.maxLength(1500)),
    fixedRoles: text(Validators.maxLength(600)),
    rotating: text(Validators.maxLength(600)),
    sequence: text(Validators.maxLength(2000)),
    rotation: text(Validators.maxLength(1000)),
    progressions: text(Validators.maxLength(1000)),
    animationUrl: text(linkValidator),
    image: text(linkValidator),
    video: text(linkValidator),
  });
}

type DrillForm = ReturnType<typeof buildForm>;
type ControlName = keyof DrillForm['controls'];

/** The fields that are not required: if they are empty they are not saved. */
const OPTIONAL_FIELDS = [
  'fixedRoles',
  'rotating',
  'sequence',
  'rotation',
  'progressions',
  'animationUrl',
  'image',
  'video',
] as const;

@Component({
  selector: 'app-drill-form',
  imports: [ReactiveFormsModule],
  templateUrl: './drill-form.component.html',
  styleUrl: './drill-form.component.scss',
})
export class DrillFormComponent {
  /** The drill being edited. If none arrives, the form is for a new one. */
  readonly drill = input<Drill | null>(null);

  /** True while saving (to block the button). */
  readonly saving = input(false);

  private readonly uploads = inject(UploadService);

  /** False if the file server is not set up: then only links can be used. */
  protected readonly canUpload = this.uploads.configured;
  protected readonly maxSize = MAX_SIZE_MB;

  /** The files chosen on the computer, waiting to be uploaded when saving. */
  protected readonly files = signal<Record<FileKind, File | null>>({ image: null, video: null });

  /** The message when a chosen file is not valid (wrong type or too big). */
  protected readonly fileErrors = signal<Record<FileKind, string | null>>({ image: null, video: null });

  /** What is being uploaded right now and how far it is (null if nothing). */
  protected readonly uploading = signal<{ kind: FileKind; percent: number } | null>(null);

  /** The message if the upload fails. */
  protected readonly uploadError = signal<string | null>(null);

  readonly saved = output<DrillData>();
  readonly cancelled = output<void>();

  protected readonly spaces = SPACES;
  protected readonly groups = GROUPS;
  protected readonly form = buildForm();

  /** Set to true when saving with errors, to show the warning at the top. */
  protected readonly submitted = signal(false);

  protected readonly optionalTexts: { name: ControlName; label: string; rows: number; hint?: string }[] = [
    { name: 'fixedRoles', label: 'Fixed roles', rows: 2 },
    { name: 'rotating', label: 'Rotating players', rows: 2 },
    { name: 'sequence', label: 'Sequence', rows: 5, hint: 'One step per line.' },
    { name: 'rotation', label: 'Rotation after each action', rows: 3 },
    { name: 'progressions', label: 'Progressions and variants', rows: 3 },
  ];

  /** Image and video: a file from the computer or, if you prefer, a link. */
  protected readonly media: { kind: FileKind; label: string; accept: string }[] = [
    { kind: 'image', label: 'Image', accept: 'image/*' },
    { kind: 'video', label: 'Video', accept: 'video/*' },
  ];

  constructor() {
    // We fill the form only when the drill changes (not every time Firestore
    // sends an update), so we do not erase what is being typed.
    effect(() => {
      const id = this.drill()?.id;
      untracked(() => this.fill(id ? this.drill() : null));
    });
  }

  private fill(drill: Drill | null): void {
    this.submitted.set(false);
    this.files.set({ image: null, video: null });
    this.fileErrors.set({ image: null, video: null });
    this.uploadError.set(null);
    this.form.reset({
      name: drill?.name ?? '',
      objective: drill?.objective ?? '',
      players: drill?.players ?? null,
      space: drill?.space ?? '',
      group: drill?.group ?? '',
      description: drill?.description ?? '',
      fixedRoles: drill?.fixedRoles ?? '',
      rotating: drill?.rotating ?? '',
      sequence: drill?.sequence ?? '',
      rotation: drill?.rotation ?? '',
      progressions: drill?.progressions ?? '',
      animationUrl: drill?.animationUrl ?? '',
      image: drill?.image ?? '',
      video: drill?.video ?? '',
    });
  }

  /** The error message of a field, or null if it is fine (or not touched yet). */
  protected error(name: ControlName): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['min'] || control.errors['max']) return 'Enter a number between 1 and 40.';
    if (control.errors['maxlength']) return 'This text is too long.';
    if (control.errors['link']) return 'Use a link that starts with https:// (or a path inside assets/).';
    return 'This value is not valid.';
  }

  /** When a file is chosen we check it and keep it until saving. */
  protected onFileChosen(kind: FileKind, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const problem = file ? this.uploads.check(file, kind) : null;

    this.fileErrors.update((errors) => ({ ...errors, [kind]: problem }));
    this.files.update((files) => ({ ...files, [kind]: problem ? null : file }));
  }

  /** Takes the image or the video out of the drill (the chosen file and the saved link). */
  protected removeMedia(kind: FileKind, fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.files.update((files) => ({ ...files, [kind]: null }));
    this.fileErrors.update((errors) => ({ ...errors, [kind]: null }));
    this.form.controls[kind].setValue('');
  }

  protected hasFileError(): boolean {
    const errors = this.fileErrors();
    return !!errors.image || !!errors.video;
  }

  protected async submit(): Promise<void> {
    if (this.uploading()) return;

    if (this.form.invalid || this.hasFileError()) {
      this.submitted.set(true);
      this.form.markAllAsTouched();
      return;
    }

    // First the chosen files go to the server; the link we get back
    // is put in the form, so it is saved in Firestore like any other field
    this.uploadError.set(null);
    try {
      for (const { kind } of this.media) {
        const file = this.files()[kind];
        if (!file) continue;

        this.uploading.set({ kind, percent: 0 });
        const link = await this.uploads.upload(file, kind, (percent) =>
          this.uploading.set({ kind, percent }),
        );
        this.form.controls[kind].setValue(link);
        this.files.update((files) => ({ ...files, [kind]: null }));
      }
    } catch (err) {
      console.error('Could not upload the file:', err);
      this.uploadError.set('The file could not be uploaded. Check your connection and try again.');
      return;
    } finally {
      this.uploading.set(null);
    }

    const value = this.form.getRawValue();
    const data: DrillData = {
      name: value.name.trim(),
      objective: value.objective.trim(),
      players: value.players!,
      space: value.space as Space,
      description: value.description.trim(),
    };

    if (value.group) data.group = value.group;

    // Firestore does not accept "undefined" values, so empty optional fields are left out
    for (const field of OPTIONAL_FIELDS) {
      const content = value[field].trim();
      if (content) data[field] = content;
    }

    this.saved.emit(data);
  }
}
