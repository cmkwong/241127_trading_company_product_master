import InputOption from './InputOption';

const Collections = () => {
  let data = [
    { id: 1, label: 'pet brush', checked: true },
    { id: 2, label: 'pet mats', checked: false },
    { id: 3, label: 'clean up', checked: false },
    { id: 4, label: 'clipper', checked: false },
    { id: 5, label: 'shower', checked: false },
    { id: 6, label: 'headwears', checked: true },
    { id: 7, label: 'tops', checked: false },
    { id: 8, label: 'Pet Bowl', checked: false },
    { id: 9, label: 'Drinking Tools', checked: false },
    { id: 10, label: 'Feeding Tools', checked: false },
    { id: 11, label: 'Glasses', checked: false },
    { id: 12, label: 'collar', checked: false },
    { id: 13, label: 'leash', checked: false },
  ];
  return (
    <div>
      <InputOption data={data} />
    </div>
  );
};

export default Collections;
