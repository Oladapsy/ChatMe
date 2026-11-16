import { useMutation, type MutationFunctionContext, type UseMutationOptions } from "@tanstack/react-query";
import { getSessionGeneration } from "@/services/authStorage";

export class SessionChangedError extends Error {
  constructor() { super("Account changed. Please try again in the current account."); }
}

type OwnedContext<T> = { generation: number; value: T };
// TanStack supplies one context object per execution, including retries/pauses.
const mutationGenerations = new WeakMap<MutationFunctionContext, number>();

// Each mutation owns its generation independently, including concurrent saves.
// Clearing TanStack's mutation cache alone cannot cancel callbacks already running.
export function useSessionMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const current = (context?: OwnedContext<TContext>) =>
    context?.generation === getSessionGeneration();
  return useMutation<TData, TError, TVariables, OwnedContext<TContext>>({
    ...options,
    onMutate: async (variables, mutationContext) => {
      const generation = getSessionGeneration();
      mutationGenerations.set(mutationContext, generation);
      const value = await options.onMutate?.(variables, mutationContext);
      if (generation !== getSessionGeneration()) throw new SessionChangedError();
      return { generation, value: value as TContext };
    },
    mutationFn: async (variables, mutationContext) => {
      const generation = mutationGenerations.get(mutationContext);
      if (generation !== getSessionGeneration()) throw new SessionChangedError();
      if (!options.mutationFn) throw new Error("Missing mutation function");
      const data = await options.mutationFn(variables, mutationContext);
      if (generation !== getSessionGeneration()) throw new SessionChangedError();
      return data;
    },
    onSuccess: async (data, variables, context, mutationContext) => {
      // Throwing also prevents a caller's per-mutation success/navigation callback.
      if (!current(context)) throw new SessionChangedError();
      await options.onSuccess?.(data, variables, context.value, mutationContext);
      if (!current(context)) throw new SessionChangedError();
    },
    onError: (error, variables, context, mutationContext) => {
      if (current(context)) return options.onError?.(error, variables, context?.value, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      if (current(context)) return options.onSettled?.(data, error, variables, context?.value, mutationContext);
    },
  });
}
