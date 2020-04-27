pkg load signal;

close all;
clear all;

if strcmp(argv(){1}, 'WEB_APP')
  path_prefix = "sound_processing/";
  addpath(strcat(path_prefix ,'jsonlab-master'));
  addpath('sound_processing');

  sound_dict = loadjson(strcat(path_prefix, 'dictionary/word_dict.json'));
  filepath = argv(){2};
  my_word = argv(){3};

else
  path_prefix = "";
  my_word = "aspirin";
  addpath(strcat(path_prefix ,'jsonlab-master'));

  sound_dict = loadjson(strcat(path_prefix, 'dictionary/word_dict.json'));
  filename = sound_dict.(my_word).file_name;
  filepath = strcat(path_prefix, "sounds/dataset1/", filename);
end

[x, fs] = audioread (filepath);

signal = x;

[B,A] = init_subbands(fs);

signal_length = size(x, 1);
win_length = fix(fs*0.02);
hanning_win = hanning(win_length);
step = fix(win_length/3);
Nfft = 512;
k = 0;
K = 11;
sub_energies = [];
ds_new = zeros(1, fix(K/2));
gw = gausswin(K);

for i = 1:step:(signal_length - win_length + 1)  
  xx = x(i:i+win_length-1, 1);                      ## window
 
  ## subband energies
  sub0 = subband_filter(B, A, xx);
  sub0 = abs(sub0);
  sub_energies = [sub_energies, sub0];
  
  if (k >= K-1)
    ds_new = [ds_new, temporal_correlation((sub_energies(:, (end-K+1):end)) .* gw')];
  end
  k++;
end

x = ds_new/max(ds_new);         ## normalization
x = trim(x, 5*10^-5);

## search for peaks
[peaks, peak_indices] = findpeaks(x);

## searching for stressed syllable
syllable_count = length(sound_dict.(my_word).stress_seq);
partition_length = length(x)/syllable_count;
[max_val, max_idx] = max(x);
partition = floor(max_idx/partition_length) + 1;
if sound_dict.(my_word).stress_seq(partition) == '1'
  printf('yes\n')
else
  printf('no\n')
end

plot(x);
axis([1,length(x)]);
hold on
plot(peak_indices, x(peak_indices), "xm");
for i = 1:syllable_count-1
  line([i*partition_length, i*partition_length],
       [0, 1],
       "linestyle", "--");
end
hold off


printf('word %s has scheme: %s\n', my_word, sound_dict.(my_word).stress_seq);
printf('Stress used at syllable: %d\n', partition);

sound(signal, fs);