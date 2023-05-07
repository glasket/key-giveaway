import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../api/api';
import { Card } from '../../components/card/Card';
import { Timer } from '../../components/timer/Timer';
import { Drop } from '../../Models';
import { Column } from '../../components/utility/Flex';
import { Toggle } from '../../components/inputs/Toggle';

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
      <Toggle state={[old, setOld]} className="ml-auto">
        Include Expired?
      </Toggle>
      {loading ? (
        <div>LOADING</div>
      ) : (
        <>
          {drops.length > 0 ? (
            <Column Element="ul" gap="0.6rem">
              {drops.map((drop) => (
                <li key={drop.id}>
                  <Card>
                    <h3>
                      <Link to={`/${drop.id}`} state={drop}>
                        {drop.name}
                      </Link>
                    </h3>
                    <Timer end={drop.ends_at} />
                  </Card>
                </li>
              ))}
            </Column>
          ) : (
            <h2>No Active Drops</h2>
          )}
        </>
      )}
    </>
  );
};
