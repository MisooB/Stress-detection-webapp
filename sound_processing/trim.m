function y = trim(x, treshold)
  for start_point = 1:length(x)
    if x(start_point) > treshold
      break
    end
  end

  for end_point = length(x):-1:start_point+1
    if x(end_point) > treshold
      break
    end
  end
  y = x(start_point:end_point);
endfunction