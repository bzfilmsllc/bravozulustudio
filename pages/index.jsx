import Head from "next/head";
export default function Home() {
  return (
    <>
      <Head>
        <title>Bravo Zulu Studio</title>
        <meta name="description" content="Official site of Bravo Zulu Studio" />
      </Head>
      <main style={{minHeight:"100vh",padding:"24px"}}>
        <h1>Bravo Zulu Studio</h1>
        <p>Welcome to the official site.</p>
      </main>
    </>
  );
}
