# Citizen paraphrase lexical recall (6 Nov 2026)

3/10 handled by current OKF/lexical retrieval (topic anywhere in selected evidence).

## Handled
- **para-arrendador-echar**: ¿Puedo echar al inquilino si no me paga la renta? → `/#desahucio`
- **para-vigor-rdl28**: ¿Ya está en marcha lo de las prórrogas de cinco años? → `/desahucios-y-alquiler#coordinacion`
- **para-vulnerable-desahucio**: Soy vulnerable y no tengo otro piso, ¿me pueden echar igual? → `/#desahucio`

## Misses (lexical gap)
- **para-casero-echar**: ¿Puede el casero echarme si dejo de pagar? → `/#propietario` (¿Cómo me afectan estas medidas como propietario o arrendador?)
- **para-casero-desahuciar**: Me quiere desahuciar el casero, ¿qué puedo hacer? → `/#propietario` (¿Cómo me afectan estas medidas como propietario o arrendador?)
- **para-indemnizacion-informal**: Si no me renuevan el alquiler, ¿me tienen que pagar algo? → _niega_ / sin evidencia
- **para-indemnizacion-doce**: ¿Me deben doce meses de renta si el casero no renueva? → `/#propietario` (¿Cómo me afectan estas medidas como propietario o arrendador?)
- **para-no-renovacion-pago**: El casero no quiere renovarme, ¿cuánto me tiene que abonar? → `/#propietario` (¿Cómo me afectan estas medidas como propietario o arrendador?)
- **para-subida-renta-casero**: ¿El casero me puede subir mucho el alquiler este año? → `/#propietario` (¿Cómo me afectan estas medidas como propietario o arrendador?)
- **para-prorroga-contrato**: Mi contrato se acaba pronto, ¿se alarga solo? → _niega_ / sin evidencia

Misses justify measuring a semantic candidate later; scope/refusal unchanged; no vector store added.
