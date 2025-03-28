import { render, screen } from '@testing-library/react';
import SocialLink from './SocialLink';
import RSS from '../../../../../public/rss.svg';

describe('SocialLinks Component', () => {
  it('render SocialLink component', () => {
    render(
      <SocialLink
        href="https://rs.school/courses/reactjs"
        src={RSS}
        alt="RSS-React"
        width={50}
        height={50}
      />
    );

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute(
      'href',
      'https://rs.school/courses/reactjs'
    );
  });
});
