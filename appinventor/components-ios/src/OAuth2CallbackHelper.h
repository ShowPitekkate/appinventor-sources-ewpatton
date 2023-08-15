//
//  OAuth2CallbackHelper.h
//  AIComponentKit
//
//  Created by Evan Patton on 8/15/23.
//  Copyright © 2023 Massachusetts Institute of Technology. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OAuth2CallbackHelper : NSObject

+ (void)doCallbackWithDelegate:(id)delegate
                      selector:(SEL)selector
                    authorizer:(id)authorizer
                       request:(NSMutableURLRequest * _Nullable)request
                         error:(NSError * _Nullable)error;

@end

NS_ASSUME_NONNULL_END
