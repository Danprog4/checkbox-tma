import axios from "axios";

export const authUser = async (initData: string) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/conference/auth`, {
    init_data: initData,
  });

  return response.data;
};

export const getStands = async (token: string) => {
  const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/conference/stands`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const visitStand = async (token: string, standId: number) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/conference/visit-stand`, {
    stand_id: standId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const unvisitStand = async (token: string, standId: number) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/conference/unvisit-stand`,
    {
      stand_id: standId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
