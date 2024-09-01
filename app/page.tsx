/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'fs/promises';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';

import Wrapper from '@/components/Wrapper';

const getImage = async (src: string) => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', 'blog', src);
    const buffer = await readFile(filePath);
    const {
      metadata: { height, width },
      ...plaiceholder
    } = await getPlaiceholder(buffer, { size: 10 });
    return {
      ...plaiceholder,
      img: { src: `/images/blog${src}`, height, width },
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    return {
      base64: '',
      img: { src: '', height: 0, width: 0 },
    };
  }
};

const Page = ({ children, ...props }: any) => {
  return (
    <Wrapper>
      <h1>posts</h1>;
    </Wrapper>
  );
};

export default Page;
