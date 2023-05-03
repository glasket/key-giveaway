import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { Item } from '../../Models';
import { API } from '../../api/api';
import { Column } from '../../components/utility/Flex';
import { Card } from '../../components/card/Card';

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
    <Column>
      <ul>
        {items.length !== 0 ? (
          items.map((i) => (
            <li key={i.id}>
              <Card>
                <h4>{i.name}</h4>
                <ul>
                  {i.items.map((g) => (
                    <Column key={i.id + g.appId}>
                      <h5>{g.name}</h5>
                      <div>{g.key}</div>
                    </Column>
                  ))}
                </ul>
              </Card>
            </li>
          ))
        ) : (
          <h4>You haven't won anything.</h4>
        )}
      </ul>
    </Column>
  );
};

export { WonItems };
