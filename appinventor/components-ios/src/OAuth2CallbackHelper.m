//
//  OAuth2CallbackHelper.m
//  AIComponentKit
//
//  Created by Evan Patton on 8/15/23.
//  Copyright © 2023 Massachusetts Institute of Technology. All rights reserved.
//

#import "OAuth2CallbackHelper.h"

@implementation OAuth2CallbackHelper

+ (void)doCallbackWithDelegate:(id)delegate selector:(SEL)selector authorizer:(id)authorizer request:(NSMutableURLRequest *)request error:(NSError *)error {
  NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[delegate methodSignatureForSelector:selector]];
  invocation.target = delegate;
  invocation.selector = selector;
  [invocation setArgument:&authorizer atIndex:2];
  [invocation setArgument:&request atIndex:3];
  [invocation setArgument:&error atIndex:4];
  [invocation invoke];
}

@end
