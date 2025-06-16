import { z } from 'zod';

export default {
  name: 'multiplyTwoNumbers',
  description: 'multiplyTwoNumbers description',
  params: {
    a: z.number(),
    b: z.number()
  },
  async run(input) {
    const { a, b } = input;
    return { content: [{ type: 'text', text: `The multiply dddd of ${a} and ${b} is ${a * b}` }] };
  }
};
