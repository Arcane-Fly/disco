import type { GetServerSideProps } from 'next';

export default function Classic() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/legacy-root',
    permanent: false
  }
});