
function Y = subband_filter(B, A, x)
  Y = [];
  for i = 1: size(B, 1)
    y = filter(B(i, :), A(i, :), x);
    Y = [Y; sum(y.^2)];     # energia
  end  
end
