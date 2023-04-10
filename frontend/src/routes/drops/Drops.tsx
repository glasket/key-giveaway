import { isSome } from 'fp-ts/lib/Option';
import { useCallback, useEffect, useState } from 'react';
import { API } from '../../api/api';
import { Timer } from '../../components/timer/timer';
import { Drop } from '../../Models';

export const Drops = () => {
  const [drops, setDrops] = useState<Array<Drop>>([]);
  const [old, setOld] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDrops = useCallback(async () => {
    setLoading(true);
    const drops = await API.GetDrops(old);
    setDrops(drops);
    setLoading(false);
  }, [old]);

  useEffect(() => {
    getDrops();
  }, [getDrops]);

  return (
    <>
      <span>
        <input
          type="checkbox"
          checked={old}
          onChange={() => setOld(!old)}
          disabled={loading}
          id="include_old_drops"
        />
        <label htmlFor="include_old_drops">Include Expired?</label>
      </span>
      {loading ? (
        <div>LOADING</div>
      ) : (
        <>
          {drops.length > 0 ? (
            <ul>
              {drops.map((drop) => (
                <li key={drop.id}>
                  <h3>{drop.name}</h3>
                  <Timer end={drop.ends_at} />
                </li>
              ))}
            </ul>
          ) : (
            <h2>No Active Drops</h2>
          )}
        </>
      )}
    </>
  );
};
