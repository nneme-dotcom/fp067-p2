import { Component, effect, input, output, signal, untracked } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Drill, DrillData, SPACES, Space } from '../../models/drill';

/** Enlace con http(s) o una ruta dentro de assets/. Vacío también vale (son datos opcionales). */
const linkValidator: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  return !value || /^(https?:\/\/|assets\/)\S+$/i.test(value) ? null : { link: true };
};

const text = (...validators: ValidatorFn[]) =>
  new FormControl('', { nonNullable: true, validators });

/** El formulario con todos los datos del drill. */
function buildForm() {
  return new FormGroup({
    nombre: text(Validators.required, Validators.maxLength(80)),
    objetivo: text(Validators.required, Validators.maxLength(300)),
    jugadoras: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(40),
    ]),
    espacio: new FormControl<Space | ''>('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: text(Validators.required, Validators.maxLength(1500)),
    rolesFijos: text(Validators.maxLength(600)),
    rotan: text(Validators.maxLength(600)),
    secuencia: text(Validators.maxLength(2000)),
    rotacion: text(Validators.maxLength(1000)),
    progresiones: text(Validators.maxLength(1000)),
    animacionUrl: text(linkValidator),
    imagen: text(linkValidator),
    video: text(linkValidator),
  });
}

type DrillForm = ReturnType<typeof buildForm>;
type ControlName = keyof DrillForm['controls'];

/** Los datos que no son obligatorios: si están vacíos no se guardan. */
const OPTIONAL_FIELDS = [
  'rolesFijos',
  'rotan',
  'secuencia',
  'rotacion',
  'progresiones',
  'animacionUrl',
  'imagen',
  'video',
] as const;

@Component({
  selector: 'app-drill-form',
  imports: [ReactiveFormsModule],
  templateUrl: './drill-form.component.html',
  styleUrl: './drill-form.component.scss',
})
export class DrillFormComponent {
  /** El drill que se edita. Si no llega ninguno, el formulario es para uno nuevo. */
  readonly drill = input<Drill | null>(null);

  /** Es true mientras se está guardando (para bloquear el botón). */
  readonly saving = input(false);

  readonly saved = output<DrillData>();
  readonly cancelled = output<void>();

  protected readonly spaces = SPACES;
  protected readonly form = buildForm();

  /** Se pone a true al intentar guardar con errores, para enseñar el aviso de arriba. */
  protected readonly submitted = signal(false);

  protected readonly optionalTexts: { name: ControlName; label: string; rows: number; hint?: string }[] = [
    { name: 'rolesFijos', label: 'Fixed roles', rows: 2 },
    { name: 'rotan', label: 'Rotating players', rows: 2 },
    { name: 'secuencia', label: 'Sequence', rows: 5, hint: 'One step per line.' },
    { name: 'rotacion', label: 'Rotation after each action', rows: 3 },
    { name: 'progresiones', label: 'Progressions and variants', rows: 3 },
  ];

  protected readonly links: { name: ControlName; label: string }[] = [
    { name: 'animacionUrl', label: '3D animation link' },
    { name: 'imagen', label: 'Image URL' },
    { name: 'video', label: 'Video URL' },
  ];

  constructor() {
    // Rellenamos el formulario solo cuando cambia el drill (no cada vez que Firestore
    // manda una actualización), para no borrar lo que se está escribiendo.
    effect(() => {
      const id = this.drill()?.id;
      untracked(() => this.fill(id ? this.drill() : null));
    });
  }

  private fill(drill: Drill | null): void {
    this.submitted.set(false);
    this.form.reset({
      nombre: drill?.nombre ?? '',
      objetivo: drill?.objetivo ?? '',
      jugadoras: drill?.jugadoras ?? null,
      espacio: drill?.espacio ?? '',
      descripcion: drill?.descripcion ?? '',
      rolesFijos: drill?.rolesFijos ?? '',
      rotan: drill?.rotan ?? '',
      secuencia: drill?.secuencia ?? '',
      rotacion: drill?.rotacion ?? '',
      progresiones: drill?.progresiones ?? '',
      animacionUrl: drill?.animacionUrl ?? '',
      imagen: drill?.imagen ?? '',
      video: drill?.video ?? '',
    });
  }

  /** El mensaje de error de un campo, o null si está bien (o aún no se ha tocado). */
  protected error(name: ControlName): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['min'] || control.errors['max']) return 'Enter a number between 1 and 40.';
    if (control.errors['maxlength']) return 'This text is too long.';
    if (control.errors['link']) return 'Use a link that starts with https:// (or a path inside assets/).';
    return 'This value is not valid.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.submitted.set(true);
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const data: DrillData = {
      nombre: value.nombre.trim(),
      objetivo: value.objetivo.trim(),
      jugadoras: value.jugadoras!,
      espacio: value.espacio as Space,
      descripcion: value.descripcion.trim(),
    };

    // Firestore no admite valores «undefined», así que los opcionales vacíos se dejan fuera
    for (const field of OPTIONAL_FIELDS) {
      const content = value[field].trim();
      if (content) data[field] = content;
    }

    this.saved.emit(data);
  }
}
