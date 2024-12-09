// Put <Switch classNames={switchStyles}> to make the switch look fancy.
// This is mostly copy/pasted from the docs.

export default {
  base: 
    "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center "+
    "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent " +
    "data-[focus=true]:border-primary border-default-200 ",

  wrapper: "p-0 h-4 overflow-visible",
  thumb: 
    "w-6 h-6 border-2 shadow-lg " +
    "group-data-[hover=true]:border-primary" +
    //selected
    "group-data-[selected=true]:ml-6" +
    // pressed
    "group-data-[pressed=true]:w-7" +
    "group-data-[selected]:group-data-[pressed]:ml-4"
};
