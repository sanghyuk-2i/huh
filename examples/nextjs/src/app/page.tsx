import { ErrorButtons } from '../components/ErrorButtons';

export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1>huh — Next.js Example</h1>
      <p>버튼을 클릭하여 에러 UI를 확인하세요.</p>
      <ErrorButtons />
    </main>
  );
}
