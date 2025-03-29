export default function UrlInput() {
  return (
    <div className="flex w-full gap-x-2">
      <label htmlFor="url" className="sr-only">
        Email address
      </label>
      <input
        id="url"
        name="url"
        type="text"
        autoComplete="off"
        className="flex w-full md:w-[300px] rounded-md bg-cta-secondary px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cta-primary placeholder:text-gray-500 sm:text-sm/6"
      />
      <button
        type="submit"
        className="flex-none rounded-md min-w-[65px] border-1 border-cta-primary bg-cta-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta-primary hover:text-cta-primary cursor-pointer"
      >
        Send
      </button>
    </div>
  );
}
