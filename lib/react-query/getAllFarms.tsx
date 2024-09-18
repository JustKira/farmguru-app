import { useQuery } from '@tanstack/react-query';

import { database } from '../database';
import Farm from '../database/model/farm';

const useGetAllFarms = () => {
  return useQuery({
    queryKey: ['farm', 'all'],
    queryFn: async () => {
      const data = await database.get<Farm>('farm').query();
      return data;
    },
  });
};

export { useGetAllFarms };
