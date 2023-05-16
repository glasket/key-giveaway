import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { Item } from '../../Models';
import { API } from '../../api/api';
import { Column } from '../../components/utility/Flex';
import { Card } from '../../components/card/Card';
import { Key } from '../../components/key/Key';

const WonItems = () => {
  const [user, _] = useContext(UserContext);
  const [items, setItems] = useState<Item[]>();

  const getWonItems = useCallback(async () => {
    setItems(await API.GetWonItems());
  }, [user, user?.id]);

  useEffect(() => {
    getWonItems();
  }, [getWonItems]);

  if (items === undefined) {
    return <>Loading</>;
  }

  return (
    <Column Element="ul" gap="1.2rem">
      {items.length !== 0 ? (
        items.map((i) => (
          <li key={i.id}>
            <Card>
              <Column gap="0.8rem">
                <h3>{i.name}</h3>
                <Column Element="ul" gap="0.8rem">
                  {i.items.map((g) => (
                    <li key={i.id + g.key}>
                      <Card>
                        <Column gap="0.6rem" align="center">
                          <h4>{g.name}</h4>
                          <Key gameKey={g.key} />
                        </Column>
                      </Card>
                    </li>
                  ))}
                </Column>
              </Column>
            </Card>
          </li>
        ))
      ) : (
        <h4>You haven't won anything.</h4>
      )}
    </Column>
  );
};

export { WonItems };
