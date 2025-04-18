function Spinner() {
  return (
    <div
      className="inline-block h-30 w-30 animate-spin rounded-full border-10 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]
    text-cta-primary"
      role="status"
      data-testid="spinner"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

export default Spinner;
