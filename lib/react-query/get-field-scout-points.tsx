import { Q } from '@nozbe/watermelondb';
import { useQuery } from '@tanstack/react-query';

import { database } from '../database';
import ScoutPoint from '../database/model/scout-point';

const useGetFieldScoutPoints = (id: string) => {
  return useQuery({
    queryKey: ['scout-points', id],
    queryFn: async () => {
      const data = await database.get<ScoutPoint>('scout_point').query().fetch();
      return data;
    },
  });
};

export { useGetFieldScoutPoints };
