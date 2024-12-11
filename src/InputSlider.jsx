import {Input} from "@nextui-org/input";
import {Slider} from "@nextui-org/slider";

export default function InputSlider({id, name, min, max, marks, value, setValue, label, size, step, shiftStep}) {
  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  return (
    <div className="flex gap-5">
        <Slider
          label={label}
          value={typeof value === 'number' ? value : min}
          onChange={handleSliderChange}
          step={step}
          minValue={min}
          maxValue={max}
          marks={marks}
          className="grow-2"
        />
        <Input
          type="number"
          name={name}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          step={step}
          className="shrink w-[15ex]"
        />
    </div>
  );
}
