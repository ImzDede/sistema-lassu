export interface ReferralResponse {
  patient: {
    id: string;
    nome: string;
    status: string;
  };
  refer: {
    id: number;
    destino: string;
    arquivoUrl: string;
    dataEncaminhamento: string;
  };
}