import InputOption from './InputOption';

const Tags = () => {
  let options = [
    { id: 1, label: 'pet brush' },
    { id: 2, label: 'pet mats' },
    { id: 3, label: 'clean up' },
    { id: 4, label: 'clipper' },
    { id: 5, label: 'shower' },
    { id: 6, label: 'headwears' },
    { id: 7, label: 'tops' },
    { id: 8, label: 'Pet Bowl' },
    { id: 9, label: 'Drinking Tools' },
    { id: 10, label: 'Feeding Tools' },
    { id: 11, label: 'Glasses' },
    { id: 12, label: 'collar' },
    { id: 13, label: 'leash' },
  ];

  let selectedOptions = [6, 1, 12];

  return (
    <div>
      <InputOption selectedOptions={selectedOptions} options={options} />
    </div>
  );
};

export default Tags;
