import { useMutation } from "@tanstack/react-query";

export const useMutationHook = (cb) => {
  const mutation = useMutation({
    mutationFn: cb,
  });
  return mutation;
};
