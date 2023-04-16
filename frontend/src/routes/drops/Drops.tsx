import { isSome } from 'fp-ts/lib/Option';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../api/api';
import { Card } from '../../components/card/Card';
import { Timer } from '../../components/timer/Timer';
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
                  <Card>
                    <h3>
                      <Link to={`/${drop.id}`}>{drop.name}</Link>
                    </h3>
                    <Timer end={drop.ends_at} />
                  </Card>
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
