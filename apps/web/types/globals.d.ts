interface PortOneResponse {
  success: boolean;
  imp_uid: string;
  merchant_uid: string;
  error_msg?: string;
}

declare global {
  interface Window {
    IMP: {
      init: (impCode: string) => void;
      request_pay: (
        params: {
          pg: string;
          pay_method: string;
          merchant_uid: string;
          name: string;
          amount: number;
          buyer_name: string;
          buyer_tel: string;
        },
        callback: (rsp: PortOneResponse) => void,
      ) => void;
    };
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
          zonecode: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

export {};
