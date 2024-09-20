import { Q } from '@nozbe/watermelondb';
import { useQuery } from '@tanstack/react-query';

import { database } from '../database';
import ScoutPoint from '../database/model/scout-point';

const getFieldsScoutPointsQueryKey = (id: string) => ['scout-points', id];

const useGetFieldScoutPoints = (id: string) => {
  return useQuery({
    queryKey: ['scout-points', id],
    queryFn: async () => {
      const data = await database
        .get<ScoutPoint>('scout_point')
        .query(Q.sortBy('date', Q.desc), Q.where('field_id', id))
        .fetch();
      return data;
    },
  });
};

export { useGetFieldScoutPoints, getFieldsScoutPointsQueryKey };
