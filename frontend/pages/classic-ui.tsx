import type { GetServerSideProps } from 'next';

export default function ClassicUI() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/legacy-root',
    permanent: false
  }
});