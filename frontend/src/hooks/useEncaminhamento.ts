import { patientService } from "@/services/patientServices";
// Não precisa mais do useFeedback aqui para erros, a página trata via useFormHandler
// Mas podemos manter para sucesso se quiser, ou mover para a página.

export function useEncaminhamento() {
  
  const saveReferral = async (
    patientId: string,
    destino: string,
    arquivo: File | null
  ) => {
    // 1. Validações básicas (lançam erro para o handler pegar)
    if (!patientId) {
      throw new Error("Selecione um paciente.");
    }

    if (!destino.trim()) {
      throw new Error("Informe o motivo ou destino do encaminhamento.");
    }

    // 2. Montagem dos dados
    const formData = new FormData();
    formData.append("destino", destino);

    if (arquivo) {
      formData.append("arquivo", arquivo);
    }

    // 3. Chamada ao serviço SEM try/catch
    // Se der erro no back (ex: "Anamnese não finalizada"), 
    // o erro vai subir para o useFormHandler da página exibir.
    await patientService.referPatient(patientId, formData);
  };

  return { saveReferral };
}