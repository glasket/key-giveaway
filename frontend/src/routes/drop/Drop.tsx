import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { API } from '../../api/api';
import { Drop as DropModel, Item } from '../../Models';
import { Card, GameCard } from '../../components/card/Card';
import { headerImageString } from '../../util/steam';
import styles from './Drop.module.css';
import { EntryCounter } from '../../components/entry-counter/EntryCounter';
import { Row } from '../../components/utility/Flex';
import ReactModal from 'react-modal';

import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';
import { UserContext } from '../../context/UserContext';
import { ItemKey } from '../../Responses';
import { asTypeC } from '../../util/as';
import { keys } from '../../../transformers/ts-transformer-keys';

export const Drop = () => {
  const { dropId } = useParams();
  if (dropId === undefined) {
    throw new Error("DropId somehow doesn't exist");
  }
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalItem, setModalItem] = useState<O.Option<number>>(O.none);
  const [user] = useContext(UserContext);
  const { state } = useLocation();

  const drop = useMemo(
    () =>
      pipe(
        state,
        asTypeC<DropModel>(keys<DropModel>()),
        O.fold(
          () => ({ id: '', name: '', ends_at: new Date(0), items: [] }),
          (drop) => drop
        )
      ),
    [state]
  );
  console.log(drop);

  const getItems = useCallback(async () => {
    setItems(await API.GetDropItems(dropId));
    setLoaded(true);
  }, [dropId]);

  useEffect(() => {
    getItems();
  }, [getItems]);

  const toggleEntry = async (itemKey: ItemKey, remove: boolean) => {
    const newItem = await (remove
      ? API.RemoveEntry(itemKey)
      : API.AddEntry(itemKey));
    // setItems((items) => {
    //   items[items.findIndex((val) => val.id === itemKey.item_id)] = newItem;
    //   return items;
    // });
    setItems(
      items.map((v) => {
        if (v.id === newItem.id) {
          return newItem;
        } else {
          return v;
        }
      })
    );
  };

  const itemsElements = items
    .map((i) => ({
      i: i,
      images: i.items.slice(0, 3).map((g) => headerImageString(g.appId)) as [
        string?,
        string?,
        string?
      ],
    }))
    .map(({ i, images }, idx) => (
      <Card
        clickable
        onClick={() => setModalItem(O.some(idx))}
        onKeyUp={(e) => e.key === 'Enter' && setModalItem(O.some(idx))}
        headerImages={images}
        key={i.id}
        tabIndex={0}
      >
        <Row>
          <h3 className="mr-auto">
            {i.name} {i.items.length > 3 && `(+${i.items.length - 3})`}
          </h3>
          <EntryCounter count={i.entries.size} />
        </Row>
      </Card>
    ));

  return loaded ? (
    items.length > 0 ? (
      <>
        <div className={styles['container']}>{itemsElements}</div>
        <ReactModal
          isOpen={O.isSome(modalItem)}
          parentSelector={() => document.getElementById('root')!}
          className="modal"
          overlayClassName="modal__overlay"
          onRequestClose={() => setModalItem(O.none)}
          shouldCloseOnOverlayClick
          overlayElement={(props, content) => <div {...props}>{content}</div>}
          style={{
            content: {
              maxWidth: `min(90vw, calc(var(--drop-card-width) * ${
                O.isSome(modalItem) ? items[modalItem.value]!.items.length : 0
              }.2)`,
            },
          }}
        >
          {pipe(
            modalItem,
            O.fold(
              () => <></>,
              (i) => {
                const item = items[i]!;
                return (
                  <>
                    <div className="modal__header">
                      <h3 className={`ul ${styles['modal__title']}`}>
                        {item.name}
                      </h3>
                      <button
                        className={styles['modal__close']}
                        onClick={() => setModalItem(O.none)}
                      >
                        X
                      </button>
                    </div>
                    <ul className={styles['modal__games']}>
                      {item.items.map((game, idx) => (
                        <li key={idx}>
                          <GameCard game={game} />
                        </li>
                      ))}
                    </ul>
                    {drop.ends_at.getTime() > Date.now() && (
                      <div className="modal__footer">
                        <button
                          disabled={user === null}
                          onClick={() =>
                            toggleEntry(
                              { item_id: item.id, drop_id: item.drop_id },
                              item.entries.has(user!.id)
                            )
                          }
                        >
                          {item.entries.has(user?.id ?? '')
                            ? 'Remove'
                            : 'Enter'}
                        </button>
                      </div>
                    )}
                  </>
                );
              }
            )
          )}
        </ReactModal>
      </>
    ) : (
      <div>No Items</div>
    )
  ) : (
    <div>LOADING</div>
  );
};
