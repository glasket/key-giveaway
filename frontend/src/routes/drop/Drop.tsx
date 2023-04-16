import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../api/api';
import { Item } from '../../Models';
import { Card } from '../../components/card/Card';
import { headerImageString } from '../../util/steam';
import styles from './Drop.module.css';
import { EntryCounter } from '../../components/entry-counter/EntryCounter';
import { Row } from '../../components/utility/Row';

export const Drop = () => {
  const { dropId } = useParams();
  if (dropId === undefined) {
    throw new Error("DropId somehow doesn't exist");
  }
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  const getItems = useCallback(async () => {
    setItems(await API.GetDropItems(dropId));
    setLoaded(true);
  }, [dropId]);

  useEffect(() => {
    getItems();
  }, [getItems]);
  console.log(items);

  return loaded ? (
    items.length > 0 ? (
      <div className={styles['container']}>
        {items
          .map((i) => ({
            i: i,
            images: i.items
              .slice(0, 3)
              .map((g) => headerImageString(g.appId)) as [
              string?,
              string?,
              string?
            ],
          }))
          .map(({ i, images }) => (
            <Card clickable headerImages={images} key={i.id}>
              <Row>
                <h3 className="mr-auto">{i.name}</h3>
                <EntryCounter count={i.entries.size} />
                {i.items.length > 3 ? (
                  <span> | +{i.items.length - 3}</span>
                ) : (
                  ''
                )}
              </Row>
            </Card>
          ))}
      </div>
    ) : (
      <div>No Items</div>
    )
  ) : (
    <div>LOADING</div>
  );
};
