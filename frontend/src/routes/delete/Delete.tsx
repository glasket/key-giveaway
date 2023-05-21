import { useCallback, useContext } from 'react';
import { API } from '../../api/api';
import { UserContext } from '../../context/UserContext';
import { Column } from '../../components/utility/Flex';

export const Delete = () => {
  const [, setUserData] = useContext(UserContext);

  const deleteCall = useCallback(async () => {
    if (confirm('Are you sure you want to delete your account?')) {
      if (await API.DeleteUser()) {
        alert('Account deleted');
        setUserData(null);
      } else {
        alert('Error while deleting account');
      }
    }
  }, []);

  return (
    <Column align="center" gap="0.8rem" className="text-center">
      <h2>WARNING</h2>
      <p>This will delete all of your data, including won items.</p>
      <em>This action cannot be undone.</em>
      <button onClick={deleteCall} className="warn bold">
        Delete Account
      </button>
    </Column>
  );
};
