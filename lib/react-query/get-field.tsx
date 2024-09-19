import { useQuery } from '@tanstack/react-query';

import { database } from '../database';
import Field from '../database/model/field';

const useGetFieldDetails = (id: string) => {
  return useQuery({
    queryKey: ['field', id],
    queryFn: async () => {
      const data = await database.get<Field>('field').find(id);
      return data;
    },
  });
};

export { useGetFieldDetails };
