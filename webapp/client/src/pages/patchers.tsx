import Layout from '../pageLayout';

export default function Patchers() {
  return (
  <>
    <Layout title="Binary Patchers" body="Since 2024 I've developed webapps to apply custom changes (patches) to retro game software. Using JavaScript to work with binary files is a real head trip!" />
    <ul>
      <li><a href="https://ff6asc.vercel.app/" target='blank'>FF6 "A Soldier's Contingency"</a></li>
      <li><a href="https://ultima-plus.vercel.app/" target='blank'>FF4 Ultima Plus</a></li>
      <li><a href="https://tdff5ric.vercel.app/" target='blank'>FF5r-IC</a></li>
      <li><a href="https://ff4ultima-plus.vercel.app/ulti.html" target='blank'>FF4 Custom Sprites Patcher</a></li>
      <li><a href="https://rom-multipatcher.vercel.app/" target='blank'>Generic Multi Patcher</a></li>
    </ul>
  </>
  );
}