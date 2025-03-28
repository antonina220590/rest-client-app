import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <div>Regular Tex</div>
      <div>
        <code>{`
const multiply = (a, b) => {
  return a * b;
};
`}</code>
      </div>
      <Link
        href="https://www.figma.com/design/sZkORayf0kHQ4kSUBMgdAu/Landing-Page-UI-Kit---Fully-customizable-landing-page-UI-kit---Export-as-HTML-(Community)?node-id=300-7954&t=dwGY7RlMeMcmfqcl-0"
        className="text-cta-primary text-sm"
      >
        Call to action
      </Link>
    </div>
  );
}
