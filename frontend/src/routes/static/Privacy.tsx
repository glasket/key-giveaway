import { Link } from 'react-router-dom';
import { Column } from '../../components/utility/Flex';

const url = 'https://giveaway.glasket.com';

export const Privacy = () => (
  <Column gap="0.8rem">
    <h1>Privacy Policy</h1>
    <p>Last updated: May 16, 2023</p>
    <p>
      This privacy policy describes the collection and use of Your Personal Data
      by the Service, alongside detailing Your rights under law.
    </p>
    <Column Element="ul" gap="1.8rem">
      <Column Element="li" gap="0.4rem">
        <h2>Interpretation and Definitions</h2>
        <h3>Intepretation</h3>
        <p>
          Words which have their initial letter capitalized are defined in the
          following section. Their definitions remain unchanged whether they
          appear as singular or plural.
        </p>
        <h3>Definitions</h3>
        <ul>
          <dl>
            <dt>Account</dt>
            <dd>The user account created and used by the Service.</dd>
            <dt>Cookies</dt>
            <dd>
              Files places on Your personal Device which are used to store
              information for access by the Service.
            </dd>
            <dt>Device</dt>
            <dd>Any device which can access the Service.</dd>
            <dt>Personal Data</dt>
            <dd>
              Any information which relates to an indentifiable individual.
            </dd>
            <dt>Service</dt>
            <dd>
              The website KGA, accessible at <a href={url}>{url}</a>
            </dd>
            <dt>Third-party Social Media Service</dt>
            <dd>
              External social networking websites through which You can login
              and access the Service.
            </dd>
            <dt>You</dt>
            <dd>
              The individual accessing the Service, or any other entity acting
              on behalf of the individual.
            </dd>
          </dl>
        </ul>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Collection and Use</h2>
        <h3>Collected Data</h3>
        <Column>
          <h4>Personal Data</h4>
          <p>
            The Service stores a unique user identification number provided by
            the Third-party Social Media Service. This number is unique to each
            user of the application, and is connected to the Third-party Social
            Media Service. Alongside this, friendship status with the Service's
            owner on the Third-party Social Media Service is collected and
            stored.
          </p>
          <p>
            No other information provided by the Third-party Social Media
            Service is collected or stored by the Service, nor is any other data
            collected by the Service itself during standard usage.
          </p>
        </Column>
        <h3>Usage of Data</h3>
        <Column>
          <h4>Personal Data</h4>
          <p>
            The Service uses Your Personal Data for regular operations. Your
            user identification number is stored in a Cookie and is used for
            identification with the server.
          </p>
          <p>
            Your friendship status is stored both locally and remotely, being
            used to display relevant actions and to verify API calls.
          </p>
          <p>
            All Personal Data which is collected by the Service is not shared
            with any third-parties.
          </p>
        </Column>
        <h3>Retention of Data</h3>
        <p>
          Your Personal Data is retained only as long as is required for the
          purposes expressed in this Privacy Policy.
        </p>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Data Deletion</h2>
        <p>
          Your Personal Data can be deleted <Link to="/delete">here</Link>. This
          deletion will remove all of Your Personal Data which has been stored
          by the Service.
        </p>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Children's Privacy</h2>
        <p>
          This Service does not address any users under the age of 13. If we
          become aware of any Personal Data which belongs to a user under the
          age of 13, it will be promptly removed.
        </p>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Links to Other Websites</h2>
        <p>
          Our Service may contain links to other websites that are operated by
          third-parties. If You click on a third-party link, You will be
          directed to that third-party's site. You are advised that you view the
          Privacy Policies for any external sites that You visit.
        </p>
        <p>
          We have no control over and assume no responsibility for the content,
          privacy policies or practices of any third party sites or services.
        </p>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Changes to this Privacy Policy</h2>
        <p>
          The Privacy Policy may be updated at any time. All changes to the
          Policy will appear on this page.
        </p>
        <p>
          Any changes to the Policy will be publicized via a prominent notice
          present on the Service, and the Last Modified date will be altered to
          match.
        </p>
        <p>
          You are advised to review this Policy for any changes periodically.
          Changes to the Policy take effect when posted.
        </p>
      </Column>

      <Column Element="li" gap="0.4rem">
        <h2>Contact</h2>
        <p>
          If you have any questions, feel free to contact us{' '}
          <a href="mailto:contact@etemper.com">here</a>.
        </p>
      </Column>
    </Column>
  </Column>
);
