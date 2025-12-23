import {AppText} from '@app/components';
import {FlexContainer, MainContainer} from '@app/containers';
import {AppColors} from '@app/utils';
import React from 'react';

export default (): React.ReactNode => {
  return (
    <MainContainer backgroundColor={AppColors.PureWhite} fillHeight>
      <FlexContainer position="center" fillHeight>
        <AppText>More</AppText>
      </FlexContainer>
    </MainContainer>
  );
};
