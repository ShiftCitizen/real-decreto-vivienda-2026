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
 * Timeline of the two decrees. Every date here is fixed by the norms themselves
 * (publication, entry into force, deferred effects, regulatory deadlines). The
 * convalidación vote is deliberately absent: it is an event that has not
 * happened yet and belongs on the status page.
 */
export const CRONOLOGIA: CronologiaEntry[] = [
  {
    fecha: '2-10-2026',
    que: 'El Congreso rechaza la convalidación de los RDL 26/2026 y 27/2026: ambos quedan derogados y dejan de producir efectos desde ese día.',
    citas: [{ norma: 'ce', art: '86.2' }],
  },
  {
    fecha: '2-10-2026',
    que: 'Entrada en vigor del RDL 27/2026: los contratos de arrendamiento de vivienda habitual se prorrogan obligatoriamente por plazos sucesivos de cinco años, o de siete si el arrendador es persona jurídica, y la indemnización por no renovación pasa a ser de doce mensualidades de renta (aplica a los vencimientos que se produzcan con posterioridad al día siguiente a dicha fecha). Quedó derogado el mismo día al rechazarse la convalidación. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos.',
    citas: [
      { norma: 'rdl27', art: 'único.1' },
      { norma: 'lau', art: '10.1' },
      { norma: 'rdl27', art: 'disposición final segunda' },
    ],
  },
  {
    fecha: '1-10-2026',
    que: 'Entrada en vigor del RDL 26/2026: freno a la compra especulativa, suspensión de desahucios, enervación extraordinaria, reforma de la LAU, prórroga extraordinaria de dos años y límite del 2 % a la actualización de la renta. Quedó derogado el 2-10-2026 al rechazarse la convalidación. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos.',
    citas: [
      { norma: 'rdl26', art: '1 a 5' },
      { norma: 'rdl26', art: 'disposiciones finales quinta y sexta' },
      { norma: 'rdl26', art: 'disposición final undécima.1' },
    ],
  },
  {
    fecha: '1-12-2026',
    que: 'Efectos del IVA: sale de la exención el alquiler amueblado con servicios propios de hostelería o de hasta 30 noches (excepto si en este segundo caso es la residencia habitual del arrendador), y las ejecuciones de obra de renovación en viviendas destinadas a arrendamiento como vivienda habitual tributan al 10 %. No llegó a aplicarse: el decreto quedó derogado el 2-10-2026.',
    citas: [
      { norma: 'rdl26', art: '7.Uno y Tres' },
      { norma: 'liva', art: '20.Uno.23.e' },
      { norma: 'liva', art: '91.Uno.2.10' },
    ],
  },
  {
    fecha: '1-1-2027',
    que: 'Nueva escala de imputación de rentas inmobiliarias en el IRPF (1,1 / 1,5 / 2 / 3 %) y reforma del rendimiento en caso de parentesco. No llegó a aplicarse: el decreto quedó derogado el 2-10-2026.',
    citas: [
      { norma: 'rdl26', art: '6.Tercero' },
      { norma: 'lirpf', art: '85.1' },
    ],
  },
  {
    fecha: 'feb. 2027',
    que: 'Vence el plazo de cuatro meses para que la CNMV cree el Registro de IIC Elegibles. Plazo de una medida derogada el 2-10-2026.',
    citas: [{ norma: 'rdl26', art: 'disposición adicional segunda' }],
  },
  {
    fecha: 'abr. 2027',
    que: 'Vence el plazo de seis meses para regular por reglamento la figura de proveedor social de vivienda asequible y las cooperativas de vivienda asequible. Plazo de una medida derogada el 2-10-2026.',
    citas: [{ norma: 'rdl26', art: 'disposición adicional primera' }],
  },
  {
    fecha: '6 meses',
    que: 'Contados desde la entrada en vigor, vence el plazo para aprobar la orden ministerial que instrumente la movilización entre entidades proveedoras de la Cuenta de Ahorro e Inversión Financia Europa. Plazo de una medida derogada el 2-10-2026.',
    citas: [
      { norma: 'rdl26', art: 'disposición final octava.2' },
      { norma: 'lmv', art: '347.7' },
    ],
  },
  {
    fecha: '31-12-2027',
    que: 'Fin del límite extraordinario de actualización anual de la renta y de la exención por transmisión de vivienda a entes públicos a precio inferior a 800.000 euros. Medidas derogadas el 2-10-2026: no se aplicaron.',
    citas: [
      { norma: 'rdl26', art: 'disposición final sexta' },
      { norma: 'lirpf', art: 'disposición adicional sexagésima quinta' },
    ],
  },
  {
    fecha: '31-12-2028',
    que: 'Fin del freno a la compra especulativa del 70 %. Es también la fecha de corte de los contratos a los que puede aplicarse la prórroga extraordinaria de la DF 5.ª. Medidas derogadas el 2-10-2026: no se aplicaron.',
    citas: [
      { norma: 'rdl26', art: '1.1' },
      { norma: 'rdl26', art: 'disposición final quinta.1' },
    ],
  },
  {
    fecha: '31-12-2030',
    que: 'Fin de la suspensión de desahucios de personas vulnerables sin alternativa habitacional. Medida derogada el 2-10-2026: no se aplicó.',
    citas: [{ norma: 'rdl26', art: '2' }],
  },
];
