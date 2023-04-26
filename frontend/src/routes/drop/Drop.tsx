import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../api/api';
import { Item } from '../../Models';
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

export const Drop = () => {
  const { dropId } = useParams();
  if (dropId === undefined) {
    throw new Error("DropId somehow doesn't exist");
  }
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalItem, setModalItem] = useState<O.Option<Item>>(O.none);
  const [user] = useContext(UserContext);

  const getItems = useCallback(async () => {
    setItems(await API.GetDropItems(dropId));
    setLoaded(true);
  }, [dropId]);

  useEffect(() => {
    getItems();
  }, [getItems]);

  const toggleEntry = (itemKey: ItemKey, remove: boolean) => {
    remove ? API.RemoveEntry(itemKey) : API.AddEntry(itemKey);
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
        onClick={() => setModalItem(O.some(i))}
        onKeyUp={(e) => e.key === 'Enter' && setModalItem(O.some(i))}
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
                O.isSome(modalItem) ? modalItem.value.items.length : 0
              }.2)`,
            },
          }}
        >
          {pipe(
            modalItem,
            O.fold(
              () => <></>,
              (item) => (
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
                      {item.entries.has(user?.id ?? '') ? 'Remove' : 'Enter'}
                    </button>
                  </div>
                </>
              )
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
