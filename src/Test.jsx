import { Button } from "@nextui-org/button"
import EmojiPicker from 'emoji-picker-react';
import {Popover, PopoverTrigger, PopoverContent} from "@nextui-org/popover"
import { useContext, useRef, useState, useEffect } from 'react';

function RxnBtn() {
  const [ menuOpen, setMenuOpen ] = useState(false);

  return (
    <Popover isOpen={menuOpen} onOpenChange={openness => { console.log("Change open to", openness); setMenuOpen(openness); }}>
      <PopoverTrigger>
        <Button>Hihi</Button>
      </PopoverTrigger>
      <PopoverContent>
        <EmojiPicker className="emoji-picker" open={true}
          onEmojiClick={emoji => {
            console.log("Added emoji", emoji);
            if (typeof onReact === 'function') { onReact(); }
          }}
          onSkinToneChange={newTone => console.log("Changed skin tone", newTone)}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function Test() {
  return (
    <>
      <RxnBtn />
      <RxnBtn />
      <RxnBtn />
    </>
  );
}
