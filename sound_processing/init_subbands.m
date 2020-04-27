function [B,A] = init_subbands(fs)
  bands = [240, 360, 480, 600, 720, 840, 1000, 1150, 1300, 1450, 1600, 1800, 2000, 2200, 2400, 2700, 3000, 3300, 3750];
  #bands = [240, 360, 480, 600, 720, 840, 1000, 1150, 1300, 1450, 1600, 1800, 2000];   # zrezane
  B = [];
  A = [];
  for i=1:length(bands)-1
    [b,a] = butter(2, [bands(i)/fs*2, bands(i+1)/fs*2]);
    B = [B; b];      # , = stlpec          ; = riadok
    A = [A; a];
  end
endfunction
