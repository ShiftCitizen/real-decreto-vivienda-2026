import type { NormaId } from './normas';

export type Cita = { norma: NormaId; art: string };

export type CronologiaEntry = {
  /** Displayed as written, e.g. "2-10-2026". Not a machine date on purpose. */
  fecha: string;
  que: string;
  /** Article references rendered as <Cite> so every one names its norm. */
  citas: Cita[];
};

/**
 * Timeline of the four decrees. Every date here is fixed by the norms themselves
 * (publication, entry into force, deferred effects, regulatory deadlines). The
 * convalidación vote is deliberately absent: it is an event that has not
 * happened yet and belongs on the status page.
 *
 * A measure does not disappear with the decree that created it, and this
 * timeline says so on every row: the RDL 29/2026 (in force since 8-10-2026)
 * reproduces the measures of the RDL 26/2026, and the RDL 28/2026 (not yet in
 * force) takes over the indefinite prolongation and the compensation. A row
 * that only said "derogada" would tell the reader that a deadline had passed
 * when the measure is being applied right now.
 */
export const CRONOLOGIA: CronologiaEntry[] = [
  {
    fecha: '15-11-2026',
    que: 'Entrada en vigor prevista del RDL 28/2026 (estabilidad de los contratos de arrendamiento de vivienda habitual), solo si la Diputación Permanente lo convalida antes. No está en vigor mientras no se convalide.',
    citas: [{ norma: 'rdl28', art: 'disposición final segunda' }],
  },
  {
    fecha: '6-11-2026',
    que: 'Plazo aproximado de treinta días para que la Diputación Permanente convalide o rechace los RDL 29/2026 y 28/2026 (arts. 78.2 y 86.2 CE). No hay fecha de sesión fijada.',
    citas: [
      { norma: 'ce', art: '78.2' },
      { norma: 'ce', art: '86.2' },
    ],
  },
  {
    fecha: '8-10-2026',
    que: 'Entrada en vigor del RDL 29/2026 (día siguiente a su publicación en el BOE), salvo disposición en contrario. Pendiente de convalidación por la Diputación Permanente. Desde ese día rigen el freno a la compra especulativa, la suspensión de desahucios, la enervación extraordinaria, la reforma de la LAU, la prórroga extraordinaria de dos años y el límite del 2 % a la actualización de la renta.',
    citas: [
      { norma: 'rdl29', art: 'disposición final undécima.1' },
      { norma: 'rdl29', art: '1 a 5' },
      { norma: 'rdl29', art: 'disposiciones finales quinta y sexta' },
    ],
  },
  {
    fecha: '7-10-2026',
    que: 'Publicación en el «BOE» núm. 249 de los RDL 29/2026 (BOE-A-2026-20823) y 28/2026 (BOE-A-2026-20822), aprobados por el Consejo de Ministros el 6 de octubre de 2026.',
    citas: [
      { norma: 'rdl29', art: 'disposición final undécima.1' },
      { norma: 'rdl28', art: 'disposición final segunda' },
    ],
  },
  {
    fecha: '6-10-2026',
    que: 'El Consejo de Ministros aprueba dos nuevos reales decretos-ley de vivienda: el RDL 29/2026 (paquete principal: desahucios, alquiler, fiscal, financiación) y el RDL 28/2026 (estabilidad de los contratos de arrendamiento). Ambos se publican en el BOE el 7 de octubre.',
    citas: [
      { norma: 'rdl29', art: 'disposición final undécima.1' },
      { norma: 'rdl28', art: 'disposición final segunda' },
    ],
  },
  {
    fecha: '2-10-2026',
    que: 'El Congreso rechaza la convalidación de los RDL 26/2026 y 27/2026: ambos quedan derogados y dejan de producir efectos desde ese día. Sus medidas no desaparecieron: las reproduce en lo sustancial el RDL 29/2026, y la prórroga por plazos sucesivos y la indemnización pasan al RDL 28/2026.',
    citas: [{ norma: 'ce', art: '86.2' }],
  },
  {
    fecha: '2-10-2026',
    que: 'Entrada en vigor del RDL 27/2026: los contratos de arrendamiento de vivienda habitual se prorrogan obligatoriamente por plazos sucesivos de cinco años, o de siete si el arrendador es persona jurídica, y la indemnización por no renovación pasa a ser de doce mensualidades de renta (aplica a los vencimientos que se produzcan con posterioridad al día siguiente a dicha fecha). Quedó derogado el mismo día al rechazarse la convalidación; la prórroga y la indemnización pasan al RDL 28/2026, que no está en vigor. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos.',
    citas: [
      { norma: 'rdl27', art: 'único.1' },
      { norma: 'lau', art: '10.1' },
      { norma: 'rdl27', art: 'disposición final segunda' },
    ],
  },
  {
    fecha: '1-10-2026',
    que: 'Entrada en vigor del RDL 26/2026: freno a la compra especulativa, suspensión de desahucios, enervación extraordinaria, reforma de la LAU, prórroga extraordinaria de dos años y límite del 2 % a la actualización de la renta. Quedó derogado el 2-10-2026 al rechazarse la convalidación; desde el 8-10-2026 sus medidas las reproduce en lo sustancial el RDL 29/2026. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos.',
    citas: [
      { norma: 'rdl26', art: '1 a 5' },
      { norma: 'rdl26', art: 'disposiciones finales quinta y sexta' },
      { norma: 'rdl26', art: 'disposición final undécima.1' },
    ],
  },
  {
    fecha: '1-12-2026',
    que: 'Efectos del IVA: sale de la exención el alquiler amueblado con servicios propios de hostelería o de hasta 30 noches (excepto si en este segundo caso es la residencia habitual del arrendador), y las ejecuciones de obra de renovación en viviendas destinadas a arrendamiento como vivienda habitual tributan al 10 %. Rigen por el art. 7 del RDL 29/2026, en vigor desde el 8-10-2026.',
    citas: [
      { norma: 'rdl29', art: '7.Uno y Tres' },
      { norma: 'liva', art: '20.Uno.23.e' },
      { norma: 'liva', art: '91.Uno.2.10' },
    ],
  },
  {
    fecha: '1-1-2027',
    que: 'Nueva escala de imputación de rentas inmobiliarias en el IRPF (1,1 / 1,5 / 2 / 3 %) y reforma del rendimiento en caso de parentesco. Rige por el art. 6 del RDL 29/2026, en vigor desde el 8-10-2026.',
    citas: [
      { norma: 'rdl29', art: '6.Tercero' },
      { norma: 'lirpf', art: '85.1' },
    ],
  },
  {
    fecha: 'feb. 2027',
    que: 'Vence el plazo de cuatro meses desde la entrada en vigor para que la CNMV cree el Registro de IIC Elegibles. Disposición adicional segunda del RDL 29/2026, en vigor desde el 8-10-2026.',
    citas: [{ norma: 'rdl29', art: 'disposición adicional segunda' }],
  },
  {
    fecha: 'abr. 2027',
    que: 'Vence el plazo de seis meses desde la entrada en vigor para regular por reglamento la figura de proveedor social de vivienda asequible y las cooperativas de vivienda asequible. Disposición adicional primera del RDL 29/2026, en vigor desde el 8-10-2026.',
    citas: [{ norma: 'rdl29', art: 'disposición adicional primera' }],
  },
  {
    fecha: '6 meses',
    que: 'Contados desde la entrada en vigor del RDL 29/2026, vence el plazo para aprobar la orden ministerial que instrumente la movilización entre entidades proveedoras de la Cuenta de Ahorro e Inversión Financia Europa. Hasta que esa orden entre en vigor, la movilización no puede efectuarse.',
    citas: [
      { norma: 'rdl29', art: '21' },
      { norma: 'lmv', art: '347.7' },
    ],
  },
  {
    fecha: '31-12-2027',
    que: 'Fin del límite extraordinario de actualización anual de la renta y de la exención por transmisión de vivienda a entes públicos a precio inferior a 800.000 euros. Ambas rigen por el RDL 29/2026 desde el 8-10-2026.',
    citas: [
      { norma: 'rdl29', art: 'disposición final sexta' },
      { norma: 'rdl29', art: '6.Segundo.Once' },
      { norma: 'lirpf', art: 'disposición adicional sexagésima quinta' },
    ],
  },
  {
    fecha: '31-12-2028',
    que: 'Fecha de corte de la prórroga extraordinaria de dos años: solo se aplica a los contratos vigentes en la entrada en vigor del RDL 29/2026 cuyo periodo de prórroga obligatoria del art. 9.1 LAU finalice antes de esa fecha.',
    citas: [
      { norma: 'rdl29', art: 'disposición final quinta' },
      { norma: 'lau', art: '9.1' },
    ],
  },
  {
    fecha: '31-12-2030',
    que: 'Fin del freno a la compra especulativa del 70 % y de la suspensión de desahucios de personas vulnerables sin alternativa habitacional. Ambos rigen por el RDL 29/2026 desde el 8-10-2026.',
    citas: [
      { norma: 'rdl29', art: '1' },
      { norma: 'rdl29', art: '2' },
    ],
  },
];
