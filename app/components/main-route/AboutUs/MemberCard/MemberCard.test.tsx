import { render, screen } from '@testing-library/react';
import MemberCard from './MemberCard';
import RSS from '../../../../../public/rss.svg';

describe('MemberCard Component', () => {
  it('render MemberCard component', () => {
    render(
      <MemberCard
        src={RSS}
        alt="RSS-React"
        name="RSS"
        role="Frontend Developer"
        description="The developer"
      />
    );

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });
});
